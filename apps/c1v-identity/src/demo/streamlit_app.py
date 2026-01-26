import os, sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from pathlib import Path
# Ensure "src" is importable when running on Streamlit Cloud
sys.path.append(str(Path(__file__).resolve().parents[1]))
import json, time
import pandas as pd
import requests
import streamlit as st
import altair as alt
import yaml
from pathlib import Path
from datetime import datetime
import random

# Component imports
from components import (
    display_project_card, get_source_schema, show_connectors_ui,
    show_single_match_resolution, determine_best_chart, show_query_history,
    show_regression_analysis, show_regression_analysis_button
)
from openai_integration import generate_sql_from_query

# Ask the Data imports
from ask_data.router import QuestionRouter
from ask_data.validator import SQLValidator
try:
    from ask_data.bq_client import BigQueryClient
    HAS_BQ = True
except Exception:
    BigQueryClient = None  # type: ignore
    HAS_BQ = False

# DQ Gate imports
from dq_gate.runner import run as dq_run
from dq_gate.gate import decide_action, append_event, get_metrics
from dq_gate.alerting.slack import send as slack_send
from dq_gate.ticketing.jira import create as jira_create

# Identity Unify imports
from identity.run_unify import run as unify_run
from common.mask import mask_dataframe

# Initialize session state
if "theme" not in st.session_state:
    st.session_state.theme = "dark"
if "current_page" not in st.session_state:
    st.session_state.current_page = "📁 Projects"
if "current_project" not in st.session_state:
    st.session_state.current_project = "test"
if "active_tab" not in st.session_state:
    st.session_state.active_tab = None
if "uploads_completed" not in st.session_state:
    st.session_state.uploads_completed = 0
if "uploaded_sources" not in st.session_state:
    st.session_state.uploaded_sources = {}
if "query_logs" not in st.session_state:
    st.session_state.query_logs = []
if "user_role" not in st.session_state:
    st.session_state.user_role = "viewer"
if "show_regression_modal" not in st.session_state:
    st.session_state.show_regression_modal = False

st.set_page_config(
    page_title="Natural Language Data Analysis",
    page_icon="🔐",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Theme toggle function
def toggle_theme():
    st.session_state.theme = "light" if st.session_state.theme == "dark" else "dark"

# Dynamic CSS based on theme
def get_theme_css():
    if st.session_state.theme == "light":
        return """
        <style>
            :root {
                --bg-primary: #FFFFFF;
                --bg-secondary: #F7F9FC;
                --text-primary: #1F2937;
                --accent: #0A5C4E;
                --accent-light: #0ea5e9;
            }
            .main {
                background-color: var(--bg-primary);
            }
            h1, h2, h3, h4, h5, h6, p, span, div {
                color: var(--text-primary) !important;
            }
            div[data-testid="metric-container"] {
                background-color: var(--bg-secondary);
                border: 1px solid #E5E7EB;
            }
            .stTabs [aria-selected="true"] {
                background-color: var(--accent) !important;
                color: white !important;
            }
            .stButton>button {
                background-color: var(--accent);
                color: white;
            }
        </style>
        """
    else:
        return """
        <style>
            :root {
                --bg-primary: #0A2F35;
                --bg-secondary: #0D3D47;
                --text-primary: #FFFFFF;
                --accent: #0ea5e9;
            }
            .main {
                background-color: var(--bg-primary);
            }
            h1, h2, h3, h4, h5, h6, p, span, div {
                color: var(--text-primary) !important;
            }
            div[data-testid="metric-container"] {
                background-color: rgba(14, 165, 233, 0.1);
                border: 1px solid rgba(14, 165, 233, 0.3);
            }
            .stTabs [aria-selected="true"] {
                background-color: var(--accent) !important;
                color: white !important;
            }
            .stButton>button {
                background-color: var(--accent);
                color: white;
            }
            [data-testid="stSidebar"] {
                background-color: rgba(10, 47, 53, 0.95);
            }
        </style>
        """

# Apply theme CSS
st.markdown(get_theme_css(), unsafe_allow_html=True)

# Header with logo and account settings
col1, col2, col3 = st.columns([2, 1, 1])
with col1:
    # Logo placeholder - replace with actual logo image
    st.markdown("### 🔐 Natural Language Data Analysis")
with col2:
    # Theme toggle
    theme_icon = "🌙" if st.session_state.theme == "dark" else "☀️"
    if st.button(theme_icon, key="theme_toggle"):
        toggle_theme()
        st.rerun()
with col3:
    # Account settings dropdown
    with st.popover("👤 Account"):
        st.write("**David Ancor**")
        st.write("Pro plan")
        st.divider()
        st.button("Settings")
        st.button("Logout")

def default_api_url() -> str:
    env_val = os.environ.get("API_URL")
    if env_val:
        return env_val
    try:
        return st.secrets["API_URL"]
    except Exception:
        return "http://localhost:8000/match"

# Enhanced Sidebar Navigation
with st.sidebar:
    st.markdown("### Navigation")
    
    page = st.radio(
        "",
        [
            "📊 Organization",
            "🔗 Connectors",
            "👥 Team Settings",
            "📚 Documentation",
            "⚙️ Configuration"
        ],
        label_visibility="collapsed",
        key="nav_radio"
    )
    
    st.session_state.current_page = page
    
    # Project selector dropdown
    st.markdown("### 📁 Projects")
    all_projects = ["test"]
    selected_project = st.selectbox(
        "Select Project",
        all_projects,
        label_visibility="collapsed",
        key="project_selector"
    )
    st.session_state.current_project = selected_project
    
    st.divider()
    
    # Quick Stats
    st.markdown("### 📊 Quick Stats")
    golden_file = Path("reports/golden_contacts.csv")
    if golden_file.exists():
        golden_df = pd.read_csv(golden_file)
        st.metric("Golden Records", f"{len(golden_df):,}")
    
    st.divider()
    st.caption("Natural Language Data Analysis")

# Main content area based on page selection
# Show Projects page content
if st.session_state.current_page == "📁 Projects":
    st.markdown("## Projects")
    
    col1, col2 = st.columns([3, 1])
    with col1:
        search = st.text_input("🔍 Search projects...", label_visibility="collapsed", placeholder="Search projects...")
    with col2:
        st.selectbox("Sort by", ["Activity", "Name", "Updated"], key="sort_projects")
    
    # All projects list
    all_projects = [
        {
            "name": "test",
            "description": "test",
            "updated": "Updated 2 days ago",
            "status": "Active"
        }
    ]
    
    # Filter projects by search
    filtered_projects = all_projects
    if search:
        filtered_projects = [p for p in all_projects if search.lower() in p["name"].lower() or search.lower() in p.get("description", "").lower()]
    
    # Add new project button
    if st.button("➕ New Project", type="primary"):
        st.info("New project creation coming soon!")
    
    st.divider()
    
    # Display projects
    if filtered_projects:
        for project in filtered_projects:
            # Highlight active project
            is_active = project["name"] == st.session_state.current_project or (st.session_state.current_project is None and project["status"] == "Active")
            
            with st.container():
                col1, col2, col3 = st.columns([3, 1, 1])
                with col1:
                    if is_active:
                        st.markdown(f"### ✅ {project['name']} (Current)")
                    else:
                        st.markdown(f"### {project['name']}")
                    st.caption(project.get('description', ''))
                    st.caption(f"**{project.get('updated', '')}**")
                
                with col2:
                    status_color = "🟢" if project['status'] == "Active" else "⚪"
                    st.caption(f"{status_color} {project['status']}")
                
                with col3:
                    if st.button("▶️ Go to Project", type="primary", key=f"open_{project['name']}", use_container_width=True):
                        st.session_state.current_project = project['name']
                        st.session_state.current_page = "📊 Organization"
                        st.rerun()
                
                st.divider()
    else:
        st.info("No projects found. Create a new project to get started.")

elif st.session_state.current_page == "📊 Organization":
    # Organization page - breadcrumbs and tabs only
    if st.session_state.current_project:
        st.markdown(f"**project** > **{st.session_state.current_project}**")
    else:
        st.markdown("## Organization Dashboard")
    
    # Main tabs for Organization view
    tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
        "⚠️ Record Merge Errors",
        "🔗 Data Connector",
        "🔐 Golden Records",
        "📊 Dashboard Builder",
        "✅ DQ Gate",
        "📋 Logs"
    ])
    
    # If navigating from Projects page, show info to switch to Golden Records tab
    if st.session_state.active_tab == "🔐 Golden Records":
        st.info("💡 Navigate to the **🔐 Golden Records** tab above to view your project dashboard.")
        st.session_state.active_tab = None  # Reset after showing message

elif st.session_state.current_page == "🔗 Connectors":
    st.markdown("## Connectors")
    st.caption("Allow reference other apps and services for more context.")
    
    show_connectors_ui()
    
    # When connectors page is selected, show tabs
    tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
        "⚠️ Record Merge Errors",
        "🔗 Data Connector",
        "🔐 Golden Records",
        "📊 Dashboard Builder",
        "✅ DQ Gate",
        "📋 Logs"
    ])


elif st.session_state.current_page in ["👥 Team Settings", "📚 Documentation"]:
    st.markdown(f"## {st.session_state.current_page}")
    st.info(f"{st.session_state.current_page} feature coming soon!")
    tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
        "⚠️ Record Merge Errors",
        "🔗 Data Connector",
        "🔐 Golden Records",
        "📊 Dashboard Builder",
        "✅ DQ Gate",
        "📋 Logs"
    ])

else:  # Configuration
    st.markdown("## Configuration")
    
    with st.expander("API Settings", expanded=True):
        api_url = st.text_input(
            "API URL",
            value=default_api_url(),
            help="Override if your API is deployed elsewhere"
        )
        
        try:
            resp = requests.get(f"{api_url.replace('/match', '/healthz')}", timeout=2)
            if resp.status_code == 200:
                st.success("🟢 API Connected")
            else:
                st.error("🔴 API Unreachable")
        except:
            st.error("🔴 API Offline")
            st.caption("Start backend: `uvicorn src.serve.api:app --port 8000`")
    
    tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
        "⚠️ Record Merge Errors",
        "🔗 Data Connector",
        "🔐 Golden Records",
        "📊 Dashboard Builder",
        "✅ DQ Gate",
        "📋 Logs"
    ])

# Set api_url if not already set
if 'api_url' not in locals():
    api_url = default_api_url()

# Only render tab content if we're NOT on the Projects page
if st.session_state.current_page != "📁 Projects":
    # -------- Record Merge Errors --------
    with tab1:
        # Show navigation message if coming from Golden Records CTA
        if st.session_state.get("navigate_to_errors", False):
            st.success("✅ Navigated to Record Merge Errors. Review and resolve conflicts below.")
            st.session_state.navigate_to_errors = False
        
        st.markdown("### ⚠️ Record Merge Errors")
        st.caption("Review and resolve record merge errors by severity level")
        
        # Error breakdown table (copied from Golden Records)
        errors_df = pd.DataFrame({
            "Severity": ["🔴 RED", "🟡 YELLOW", "🟢 GREEN"],
            "Error Type": ["missing_consent", "type_mismatch", "resolved"],
            "Count": [12, 28, 156],
            "Details": [
                "PII field without consent_scope",
                "Expected timestamp, got string",
                "Successfully merged"
            ]
        })
        
        st.markdown("#### Error Breakdown by Severity")
        st.dataframe(errors_df, use_container_width=True)
        
        st.divider()
        
        # Filter errors by severity
        severity_filter = st.selectbox(
            "Filter by Severity",
            ["All", "🔴 RED", "🟡 YELLOW", "🟢 GREEN"],
            key="severity_filter"
        )
        
        if severity_filter != "All":
            filtered_errors = errors_df[errors_df["Severity"] == severity_filter]
            st.dataframe(filtered_errors, use_container_width=True)
        
        st.divider()
        
        # Single Match Resolution Interface (for resolving errors)
        st.markdown("#### Resolve Record Merge Error")
        st.caption("Select records to resolve merge conflicts")
        
        col1, col2 = st.columns(2)
        with col1:
            r1_txt = st.text_area("Record 1 (JSON)", value='{"email":"a@x.com","first_name":"Alex","zip":"94107"}', height=220)
        with col2:
            r2_txt = st.text_area("Record 2 (JSON)", value='{"email":"a@x.com","first_name":"ALEX","zip":"94107"}', height=220)

        if st.button("Match Records", type="primary"):
            try:
                record1 = json.loads(r1_txt)
                record2 = json.loads(r2_txt)
                payload = {"record1": record1, "record2": record2}
                resp = requests.post(api_url, json=payload, timeout=10)
                resp.raise_for_status()
                result = resp.json()
                
                confidence = result.get("confidence", 0.0)
                
                # Create merged record
                merged = {
                    **record1,
                    **record2,
                    "merged_at": datetime.now().isoformat(),
                    "confidence": confidence,
                    "match": result.get("match", False)
                }
                
                # Show detailed resolution
                show_single_match_resolution(record1, record2, merged, confidence)
                
            except Exception as e:
                st.error(f"Error: {e}")

    # -------- Data Connector --------
    with tab2:
        st.markdown("### 📁 Upload Your Data Sources")
        st.caption("Upload CSV files to find duplicate records across data sources. Files must contain an 'email' column.")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("#### Source A")
            f1 = st.file_uploader(
                "Upload CSV",
                type=["csv"],
                key="csv_a",
                help="Upload leads, CRM data, or customer records.",
                label_visibility="collapsed"
            )
            
            if f1 and f1.name not in st.session_state.uploaded_sources:
                with st.spinner("🔐 Encrypting PII..."):
                    time.sleep(2)  # Simulate encryption
                st.success("✅ Encryption complete")
                schema = get_source_schema(f1)
                st.session_state.uploaded_sources[f1.name] = {
                    "file": f1,
                    "schema": schema,
                    "encrypted": True
                }
                st.session_state.uploads_completed += 1
                
                with st.expander("View Schema"):
                    st.json(schema)
            elif f1:
                st.info(f"✓ {f1.name} already processed")
        
        with col2:
            st.markdown("#### Source B")
            f2 = st.file_uploader(
                "Upload CSV",
                type=["csv"],
                key="csv_b",
                help="Upload sales, financial, or contact data.",
                label_visibility="collapsed"
            )
            
            if f2 and f2.name not in st.session_state.uploaded_sources:
                with st.spinner("🔐 Encrypting PII..."):
                    time.sleep(2)  # Simulate encryption
                st.success("✅ Encryption complete")
                schema = get_source_schema(f2)
                st.session_state.uploaded_sources[f2.name] = {
                    "file": f2,
                    "schema": schema,
                    "encrypted": True
                }
                st.session_state.uploads_completed += 1
                
                with st.expander("View Schema"):
                    st.json(schema)
            elif f2:
                st.info(f"✓ {f2.name} already processed")
        
        st.divider()
        
        # Run Golden Records button
        if st.session_state.uploads_completed >= 2:
            if st.button("✨ Run Golden Records", type="primary", use_container_width=True):
                st.session_state.current_page = "📊 Organization"
                st.session_state.active_tab = "golden_records"
                st.rerun()
        else:
            st.button("✨ Run Golden Records", disabled=True, use_container_width=True)
            st.caption(f"Upload {2 - st.session_state.uploads_completed} more data source(s) to enable matching")
        
        # Legacy matching functionality
        if st.session_state.uploads_completed >= 2 and f1 and f2:
            st.markdown("### ⚙️ Processing Settings")
            col1, col2 = st.columns(2)
            with col1:
                max_rows = st.slider("Row cap per file", min_value=50, max_value=1000, value=200, step=50)
            with col2:
                cost_per_dupe = st.number_input("Cost per duplicate (USD)", min_value=0.0, value=5.0, step=0.5)
            
            if st.button("Find Matches", type="primary"):
                try:
                    df1 = pd.read_csv(f1).head(max_rows)
                    df2 = pd.read_csv(f2).head(max_rows)
                    
                    if "email" not in df1.columns or "email" not in df2.columns:
                        st.warning("Both files must contain an 'email' column.")
                    else:
                        df1["email_norm"] = df1["email"].astype(str).str.strip().str.lower()
                        df2["email_norm"] = df2["email"].astype(str).str.strip().str.lower()
                        candidates = df1.merge(df2, on="email_norm", suffixes=("_a", "_b"))
                        
                        if candidates.empty:
                            st.info("ℹ️ No overlapping emails found")
                        else:
                            st.info(f"🔍 Found {len(candidates)} candidate pairs")
                            
                            results = []
                            start = time.time()
                            progress_bar = st.progress(0)
                            
                            for idx, (_, row) in enumerate(candidates.iterrows()):
                                progress_bar.progress((idx + 1) / len(candidates))
                                a_cols = [c for c in candidates.columns if c.endswith("_a")]
                                b_cols = [c for c in candidates.columns if c.endswith("_b")]
                                rec1 = {"email": row["email_norm"], **{c[:-2]: row[c] for c in a_cols}}
                                rec2 = {"email": row["email_norm"], **{c[:-2]: row[c] for c in b_cols}}
                                
                                try:
                                    j = requests.post(api_url, json={"record1": rec1, "record2": rec2}, timeout=5).json()
                                    results.append({
                                        "email": row["email_norm"],
                                        "match": j.get("match", False),
                                        "confidence": j.get("confidence", 0.0),
                                        "reason": j.get("reason", ""),
                                    })
                                except Exception as e:
                                    results.append({
                                        "email": row.get("email_norm", ""),
                                        "match": False,
                                        "confidence": 0.0,
                                        "reason": f"error: {str(e)[:50]}"
                                    })
                            
                            progress_bar.empty()
                            dur = time.time() - start
                            
                            out = pd.DataFrame(results).sort_values("confidence", ascending=False)
                            dupes = int(out["match"].sum()) if not out.empty else 0
                            roi = dupes * cost_per_dupe
                            
                            st.success("✅ Matching Complete!")
                            col1, col2, col3, col4 = st.columns(4)
                            with col1:
                                st.metric("Duplicates Found", dupes)
                            with col2:
                                st.metric("Estimated Savings", f"${roi:,.2f}")
                            with col3:
                                st.metric("Processing Time", f"{dur:.1f}s")
                            with col4:
                                avg_conf = out['confidence'].mean() if not out.empty else 0
                                st.metric("Avg Confidence", f"{avg_conf:.1%}")
                            
                            st.dataframe(out, use_container_width=True)
                except Exception as e:
                    st.error(f"Error: {e}")

    # -------- Golden Records --------
    with tab3:
        st.markdown("### 🔐 Golden Records & Identity Unification")
        
        col1, col2 = st.columns([3, 1])
        
        golden_file = Path("reports/golden_contacts.csv")
        unify_events_file = Path("reports/unify_events.csv")
        
        with col2:
            if golden_file.exists() and unify_events_file.exists():
                golden_df = pd.read_csv(golden_file)
                events_df = pd.read_csv(unify_events_file)
                
                total_sources = 0
                for source in ["leads", "sales", "financial"]:
                    if Path(f"data/synth/{source}.csv").exists():
                        total_sources += len(pd.read_csv(f"data/synth/{source}.csv"))
                
                dup_rate = 1 - (len(golden_df) / total_sources) if total_sources > 0 else 0
                auto_merge_rate = len(events_df[events_df["decision"] == "auto_merge"]) / len(events_df) if len(events_df) > 0 else 0
                
                st.metric("Golden Records", f"{len(golden_df):,}")
                st.metric("Match Rate", "87%")
                needs_review = random.randint(30, 60)
                st.metric("Needs Review", needs_review, delta="↓ 12 from yesterday")
                st.metric("Data Quality", "94%")
        
        with col1:
            # Error summary metrics
            col1_1, col1_2, col1_3 = st.columns(3)
            with col1_1:
                st.metric("🔴 RED Errors", "12", delta="Critical")
            with col1_2:
                st.metric("🟡 YELLOW Errors", "28", delta="Warning")
            with col1_3:
                st.metric("🟢 GREEN", "156", delta="Resolved")
            
            # CTA to navigate to Record Merge Errors tab
            if st.button("🔧 Solve Record Merge Errors", type="primary", use_container_width=True):
                st.session_state.navigate_to_errors = True
                st.info("💡 Please navigate to the **⚠️ Record Merge Errors** tab above to review and resolve merge conflicts.")
            
            st.divider()
            
            # Run unification button
            if st.button("Run Identity Unification", type="primary"):
                with st.spinner("Running unification..."):
                    result = unify_run()
                    
                    st.success("✅ Identity Unification Complete!")
                    col1, col2, col3, col4 = st.columns(4)
                    with col1:
                        st.metric("Total Records", f"{result['total_records']:,}")
                    with col2:
                        st.metric("Golden Records", f"{result['golden_records']:,}")
                    with col3:
                        st.metric("Duplicate Rate", f"{result['dup_rate']:.1%}", delta="↓ duplicates removed", delta_color="inverse")
                    with col4:
                        st.metric("Auto-merge Rate", f"{result.get('auto_merge_rate', 0):.1%}", delta="automated", delta_color="normal")
                    
                    st.balloons()
            
                # Display controls
                role = st.selectbox(
                    "View as role",
                    ["viewer", "analyst", "engineer", "admin"],
                    key="unify_role"
                )
                st.session_state.user_role = role
                
                # Display golden records
                if golden_file.exists():
                    st.markdown("#### Merged Golden Contacts")
                    golden_df = pd.read_csv(golden_file)
                    
                    if role != "admin":
                        display_df = mask_dataframe(golden_df.head(100), role)
                    else:
                        display_df = golden_df.head(100)
                    
                    st.dataframe(display_df, use_container_width=True)
                    
                    # View merged contact record button
                    if st.button("View Merged Contact Record", type="secondary"):
                        if not display_df.empty:
                            sample_record = display_df.iloc[0].to_dict()
                            st.session_state.view_record = sample_record
                            st.rerun()
                        
                        if role == "admin":
                            st.download_button(
                                "Download Golden Records",
                                data=golden_df.to_csv(index=False),
                                file_name="golden_contacts.csv",
                                mime="text/csv"
                            )
                
                # Show match events
                if unify_events_file.exists():
                    st.markdown("#### Match Events")
                    events_df = pd.read_csv(unify_events_file)
                    
                    decision_counts = events_df["decision"].value_counts()
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        st.metric("Auto-merged", decision_counts.get("auto_merge", 0))
                    with col2:
                        st.metric("Needs Review", decision_counts.get("needs_review", 0))
                    with col3:
                        st.metric("No Match", decision_counts.get("no_match", 0))
                    
                    st.dataframe(
                        events_df.tail(50).sort_values("score", ascending=False),
                        use_container_width=True
                    )

    # -------- Dashboard Builder --------
    with tab4:
        st.markdown("### 📊 Dashboard Builder")
        
        # Templates
        st.markdown("#### Templates")
        cols = st.columns(4)
        templates = [
            ("Full Funnel Analysis", True),
            ("Q3 vs Q4 Results", True),
            ("Customer Segmentation", False),
            ("Revenue Attribution", True)
        ]
        
        for idx, (template, coming_soon) in enumerate(templates):
            with cols[idx]:
                if coming_soon:
                    st.button(template, disabled=True, key=f"template_{idx}")
                    st.caption("Coming soon")
                else:
                    st.button(template, key=f"template_{idx}")
        
        st.divider()

        # Analytics tools
        st.markdown("#### Analytics Tools")
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            show_regression_analysis_button()

        st.divider()

        # Query interface
        query = st.text_area("Ask a question about your data", height=100)
        
        col1, col2 = st.columns([1, 4])
        with col1:
            use_openai = st.checkbox("Use OpenAI", value=False)
        
        if st.button("Generate Dashboard", type="primary"):
            if use_openai:
                sql = generate_sql_from_query(query)
                if sql:
                    st.success("SQL generated by OpenAI")
                    st.code(sql, language="sql")
                else:
                    st.warning("OpenAI API not configured. Using template router.")
                    router = QuestionRouter()
                    routed = router.route(query)
                    if routed.get("routed"):
                        sql = routed["sql"]
                        st.code(sql, language="sql")
                    else:
                        st.error("Could not generate SQL. Please refine your query.")
                        sql = None
            else:
                router = QuestionRouter()
                routed = router.route(query)
                if routed.get("routed"):
                    sql = routed["sql"]
                    st.code(sql, language="sql")
                else:
                    st.warning("Template not matched. Enable OpenAI for LLM fallback.")
                    sql = None
            
            if sql:
                # Execute query (simulated)
                validator = SQLValidator()
                ok, sql_or_msg = validator.validate_and_sanitize(sql)
                
                if ok:
                    # Simulate data
                    import numpy as np
                    dates = pd.date_range(end=pd.Timestamp.now(), periods=30, freq="D")
                    df = pd.DataFrame({
                        "date": dates,
                        "value": np.random.randint(1000, 10000, len(dates))
                    })
                    
                    st.markdown("#### Results")
                    st.dataframe(df, use_container_width=True)
                    
                    # Generate chart
                    try:
                        import plotly.express as px
                        chart = px.line(df, x="date", y="value", title="Query Results")
                        st.plotly_chart(chart, use_container_width=True)
                    except:
                        chart = alt.Chart(df).mark_line(point=True).encode(x="date:T", y="value:Q")
                        st.altair_chart(chart, use_container_width=True)
                    
                    # Log query
                    st.session_state.query_logs.append({
                        "timestamp": datetime.now().isoformat(),
                        "query": query,
                        "sql": sql,
                        "rows": len(df)
                    })
                else:
                    st.error(sql_or_msg)
        
        # Query Logs
        with st.expander("📋 Query Logs"):
            show_query_history()

    # -------- DQ Gate Tab --------
    with tab5:
        st.markdown("### ✅ Data Quality Gate")
        st.caption("Automated data quality validation and monitoring")
        
        col1, col2 = st.columns([3, 1])
        with col2:
            st.metric("Coverage", f"{get_metrics()['coverage_pct']}%", delta=f"{get_metrics()['coverage_pct']}% sources", delta_color="normal")
            st.metric("Prevented Defects", get_metrics()['prevented_defects'], delta="↓ issues blocked", delta_color="inverse")
            st.metric("MTTR (hours)", get_metrics()['mttr_hours'], delta="avg resolution", delta_color="normal")
        
        with col1:
            contracts_dir = Path("configs/contracts")
            contracts = list(contracts_dir.glob("*.yaml")) if contracts_dir.exists() else []
            
            if not contracts:
                st.warning("No contracts found in configs/contracts/")
                if st.button("Generate Sample Contracts"):
                    for source in ["financial", "leads", "sales"]:
                        os.system(f"python -m src.dq_gate.contract_scaffold data/synth/{source}.csv {source} {source}-owner@company.com")
                    st.rerun()
            else:
                contract_file = st.selectbox(
                    "Select Contract",
                    contracts,
                    format_func=lambda p: p.stem.title()
                )
                
                col1, col2 = st.columns(2)
                with col1:
                    env_options = ["staging", "prod_week1", "prod"]
                    env_default = None
                    try:
                        env_default = st.secrets.get("APP_ENV") if hasattr(st, "secrets") else None
                    except Exception:
                        env_default = None
                    try:
                        env_index = env_options.index(env_default) if env_default in env_options else 1
                    except Exception:
                        env_index = 1
                    env = st.selectbox("Environment", env_options, index=env_index)
                
                with col2:
                    csv_path = st.text_input(
                        "CSV Path (optional)",
                        value=f"data/synth/{contract_file.stem}.csv"
                    )
                
                if st.button("Run DQ Checks", type="primary"):
                    result = dq_run(str(contract_file), csv_path if csv_path else None, env)
                    action = decide_action(result["severity"], env)
                    
                    col1, col2 = st.columns(2)
                    with col1:
                        severity_color = {
                            "GREEN": "🟢",
                            "AMBER": "🟡",
                            "RED": "🔴"
                        }
                        st.subheader(f"{severity_color.get(result['severity'], '')} Severity: {result['severity']}")
                    
                    with col2:
                        action_icon = {
                            "PASS": "✅",
                            "WARN": "⚠️",
                            "BLOCK": "🚫"
                        }
                        st.subheader(f"{action_icon.get(action, '')} Action: {action}")
                    
                    if result["issues"]:
                        st.warning(f"Found {len(result['issues'])} issues:")
                        issues_df = pd.DataFrame(result["issues"])
                        st.dataframe(issues_df, use_container_width=True)
                        
                        if result["severity"] in ["AMBER", "RED"]:
                            alerts = yaml.safe_load(Path("configs/alert_routes.yaml").read_text())
                            route = alerts["routes"].get(result["source"], {})
                            
                            slack_send(
                                alerts["slack_webhook"],
                                route.get("slack_channel", "#data-quality"),
                                f"DQ Alert: {result['source']} - {result['severity']} in {env}",
                                result["severity"]
                            )
                            
                            if result["severity"] == "RED":
                                jira_create(
                                    route.get("jira_project", "DQ"),
                                    f"DQ Violation: {result['source']} - {env}",
                                    json.dumps(result["issues"], indent=2),
                                    route.get("pager_primary", "data-team@company.com")
                                )
                    else:
                        st.success("All checks passed!")
                    
                    append_event(result, action)
                
                st.markdown("#### Recent DQ Events")
                events_file = Path("reports/dq_events.csv")
                if events_file.exists():
                    events_df = pd.read_csv(events_file)
                    st.dataframe(
                        events_df.tail(20).sort_values("ts", ascending=False),
                        use_container_width=True
                    )

    # -------- Logs Tab --------
    with tab6:
        st.markdown("### 📋 Application Logs")
        
        log_type = st.selectbox("Log Type", ["All", "Query Logs", "DQ Events", "Merge Events"])
        
        if log_type == "Query Logs":
            show_query_history()
        elif log_type == "DQ Events":
            events_file = Path("reports/dq_events.csv")
            if events_file.exists():
                events_df = pd.read_csv(events_file)
                st.dataframe(events_df.tail(50), use_container_width=True)
            else:
                st.info("No DQ events logged yet.")
        elif log_type == "Merge Events":
            unify_events_file = Path("reports/unify_events.csv")
            if unify_events_file.exists():
                events_df = pd.read_csv(unify_events_file)
                st.dataframe(events_df.tail(50), use_container_width=True)
            else:
                st.info("No merge events logged yet.")
        else:
            st.info("Select a log type to view.")

# Display regression analysis modal if triggered
show_regression_analysis()
