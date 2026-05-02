"""Fixture-replay tests for orchestrator.render_artifact.

Per D-V21.24 input shape: render_artifact receives `agent_output_payload`
(pre-computed by Vercel-side LangGraph), NOT raw project intake. Tests stub
the canonical generator subprocess so we exercise the writer contract +
circuit-breaker path without installing weasyprint / mmdc / chromium.

Run:
    cd services/python-sidecar
    SIDECAR_DRY_RUN=1 python3 -m unittest __tests__.orchestrator.test
"""
from __future__ import annotations

import json
import os
import sys
import unittest
from pathlib import Path
from unittest import mock

HERE = Path(__file__).resolve().parent
SIDECAR = HERE.parent
sys.path.insert(0, str(SIDECAR))

# Force dry-run before importing orchestrator so module-level state honors it.
os.environ.setdefault("SIDECAR_DRY_RUN", "1")
os.environ.setdefault("SUPABASE_URL", "http://stub")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "stub")

import orchestrator  # noqa: E402


SEVEN_FAMILIES = [
    "recommendation_json",
    "recommendation_html",
    "recommendation_pdf",
    "recommendation_pptx",
    "hoq_xlsx",
    "fmea_early_xlsx",
    "fmea_residual_xlsx",
]


def _fake_generator_run(*, success: bool, written_path: Path):
    """Build a fake subprocess.run that mimics the generator stdout envelope."""

    def _runner(cmd, capture_output=True, timeout=None):  # noqa: ARG001
        # cmd = ["python3", "<gen>.py", "<input.json>"]
        input_path = Path(cmd[-1])
        payload = json.loads(input_path.read_text())
        target = payload["targets"][0]
        if success:
            written_path.parent.mkdir(parents=True, exist_ok=True)
            written_path.write_bytes(b"fake-bytes-for-test")
            envelope = {
                "ok": True,
                "generated": [
                    {
                        "target": target,
                        "path": str(written_path),
                        "bytes": written_path.stat().st_size,
                        "sha256": "deadbeef" * 8,
                    }
                ],
                "warnings": [],
                "elapsedMs": 12,
            }
            stdout = (json.dumps(envelope) + "\n").encode("utf-8")
            return mock.Mock(returncode=0, stdout=stdout, stderr=b"")
        envelope = {
            "ok": False,
            "error": {"code": "RENDER_FAILED", "message": "boom", "phase": "render"},
            "partial": [],
        }
        stdout = (json.dumps(envelope) + "\n").encode("utf-8")
        return mock.Mock(returncode=1, stdout=stdout, stderr=b"boom\n")

    return _runner


class RenderArtifactSuite(unittest.TestCase):
    """Per D-V21.24: fixture-replay for the 7 artifact families."""

    def setUp(self):
        # Make every generator path "exist" by pointing at any file.
        self._patch_exists = mock.patch.object(
            orchestrator.Path, "exists", autospec=True, return_value=True
        )
        self._patch_exists.start()
        self.upserts: list[dict] = []
        self.upload_calls: list[dict] = []

        def _capture_upsert(**kwargs):
            self.upserts.append(kwargs)

        def _capture_upload(**kwargs):
            self.upload_calls.append(kwargs)
            return f"project-artifacts/{kwargs['project_id']}/{kwargs['artifact_kind']}.{kwargs['ext']}"

        self._patch_upsert = mock.patch.object(
            orchestrator, "_upsert_artifact_row", side_effect=_capture_upsert
        )
        self._patch_upload = mock.patch.object(
            orchestrator, "_upload_to_storage", side_effect=_capture_upload
        )
        self._patch_upsert.start()
        self._patch_upload.start()

    def tearDown(self):
        mock.patch.stopall()

    def _stub_payload(self) -> dict:
        return {"projectName": "fixture", "summary": "stub", "winningAlternative": "A1"}

    def test_each_family_writes_ready_row(self):
        for kind in SEVEN_FAMILIES:
            with self.subTest(artifact_kind=kind):
                self.upserts.clear()
                self.upload_calls.clear()
                fake_out = SIDECAR / "__tests__" / "tmp" / f"{kind}.bin"
                with mock.patch.object(
                    orchestrator.subprocess,
                    "run",
                    side_effect=_fake_generator_run(success=True, written_path=fake_out),
                ):
                    result = orchestrator.render_artifact(
                        project_id="00000000-0000-0000-0000-0000000000aa",
                        artifact_kind=kind,
                        agent_output_payload=self._stub_payload(),
                    )
                self.assertTrue(result["ok"], f"{kind}: {result}")
                self.assertEqual(len(self.upserts), 1)
                self.assertEqual(self.upserts[0]["status"], "ready")
                self.assertIn("sha256", self.upserts[0])
                self.assertEqual(self.upserts[0]["artifact_kind"], kind)
                self.assertEqual(len(self.upload_calls), 1)

    def test_failure_in_one_family_does_not_halt_others(self):
        """Per circuit-breaker contract: a failed render writes 'failed' row
        and the process keeps serving subsequent requests."""
        results = {}
        for i, kind in enumerate(SEVEN_FAMILIES):
            should_fail = (kind == "recommendation_pdf")
            fake_out = SIDECAR / "__tests__" / "tmp" / f"{kind}.bin"
            with mock.patch.object(
                orchestrator.subprocess,
                "run",
                side_effect=_fake_generator_run(success=not should_fail, written_path=fake_out),
            ):
                results[kind] = orchestrator.render_artifact(
                    project_id="00000000-0000-0000-0000-0000000000bb",
                    artifact_kind=kind,
                    agent_output_payload=self._stub_payload(),
                )

        self.assertFalse(results["recommendation_pdf"]["ok"])
        self.assertIn("failure_reason", results["recommendation_pdf"])
        for kind in SEVEN_FAMILIES:
            if kind == "recommendation_pdf":
                continue
            self.assertTrue(results[kind]["ok"], f"{kind} should have rendered")

        # Every kind should have produced exactly one upsert row.
        kinds_upserted = [u["artifact_kind"] for u in self.upserts]
        self.assertEqual(sorted(kinds_upserted), sorted(SEVEN_FAMILIES))
        failed_rows = [u for u in self.upserts if u["status"] == "failed"]
        self.assertEqual(len(failed_rows), 1)
        self.assertEqual(failed_rows[0]["artifact_kind"], "recommendation_pdf")
        self.assertIn("failure_reason", failed_rows[0])

    def test_unknown_artifact_kind_writes_failed_row(self):
        result = orchestrator.render_artifact(
            project_id="00000000-0000-0000-0000-0000000000cc",
            artifact_kind="not_a_real_kind",
            agent_output_payload=self._stub_payload(),
        )
        self.assertFalse(result["ok"])
        self.assertEqual(len(self.upserts), 1)
        self.assertEqual(self.upserts[0]["status"], "failed")
        self.assertIn("unknown artifact_kind", self.upserts[0]["failure_reason"])


class RegistryShapeSuite(unittest.TestCase):
    def test_seven_families_registered(self):
        for kind in SEVEN_FAMILIES:
            self.assertIn(kind, orchestrator.ARTIFACT_REGISTRY, kind)

    def test_registry_entries_well_formed(self):
        required = {"generator", "target", "schema_ref", "ext", "format"}
        for kind, spec in orchestrator.ARTIFACT_REGISTRY.items():
            self.assertTrue(required.issubset(spec.keys()), f"{kind}: {spec}")


if __name__ == "__main__":
    unittest.main()
