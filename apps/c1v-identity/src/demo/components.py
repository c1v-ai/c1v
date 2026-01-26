"""
Reusable UI components for the Streamlit app.
"""
import streamlit as st
import pandas as pd
from typing import Dict, List, Optional


def display_project_card(project: Dict) -> None:
    """Display a project card in Claude-like style."""
    with st.container():
        st.markdown(f"### {project['name']}")
        st.caption(project.get('description', ''))
        st.caption(f"**{project.get('updated', '')}**")
        if project.get('status'):
            status_color = "🟢" if project['status'] == "Active" else "⚪"
            st.caption(f"{status_color} {project['status']}")
        st.divider()


def get_source_schema(file_upload) -> Dict:
    """Extract schema from uploaded CSV file."""
    if file_upload is None:
        return {}
    
    try:
        df = pd.read_csv(file_upload)
        return {
            "columns": list(df.columns),
            "row_count": len(df),
            "dtypes": df.dtypes.to_dict(),
            "sample_data": df.head(3).to_dict('records')
        }
    except Exception:
        return {}


def show_connectors_ui() -> None:
    """Display Claude-style connectors interface."""
    connectors = [
        {"name": "Salesforce", "icon": "☁️", "status": "coming_soon"},
        {"name": "HubSpot", "icon": "🔧", "status": "coming_soon"},
        {"name": "Stripe", "icon": "💳", "status": "coming_soon"},
        {"name": "QuickBooks", "icon": "📊", "status": "coming_soon"},
        {"name": "NetSuite", "icon": "📈", "status": "coming_soon"},
        {"name": "CSV Upload", "icon": "📁", "status": "available"}
    ]
    
    for connector in connectors:
        col1, col2, col3 = st.columns([1, 2, 2])
        with col1:
            st.write(connector["icon"])
        with col2:
            st.write(connector["name"])
        with col3:
            if connector["status"] == "coming_soon":
                st.caption("Coming soon")
                st.button("Configure", key=f"conn_{connector['name']}", disabled=True)
            elif connector["status"] == "available":
                st.caption("Available")
                st.button("Configure", key=f"conn_{connector['name']}")
            else:
                st.caption("Connected")
                st.button("...", key=f"conn_menu_{connector['name']}")
        st.divider()


def show_single_match_resolution(record1: Dict, record2: Dict, merged: Dict, confidence: float) -> None:
    """Display detailed single match resolution interface."""
    st.markdown("### Single Match Resolution")
    
    # Confidence score
    st.metric("Confidence Score", f"{confidence:.0%}")
    
    if confidence >= 0.9:
        st.info("✅ Recommendation: Auto-merge")
    elif confidence >= 0.66:
        st.warning("⚠️ Recommendation: Review required")
    else:
        st.error("❌ Recommendation: Needs manual review")
    
    # Three-column layout
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("#### Source A")
        st.json(record1)
    
    with col2:
        st.markdown("#### Source B")
        st.json(record2)
    
    with col3:
        st.markdown("#### Merged Record")
        st.json(merged)
        
    # Survivorship rules
    with st.expander("📋 Survivorship Rules Applied"):
        st.write("- **Email:** Selected from Source A (more recent)")
        st.write("- **Phone:** Selected from Source B (validated format)")
        st.write("- **Name:** Merged from both sources")
        st.write("- **Address:** Selected from Source A (longer format)")
        st.write("- **Metadata:** Source field preserved from both")


def determine_best_chart(df: pd.DataFrame) -> Optional:
    """Determine best chart type based on data structure."""
    try:
        import plotly.express as px
        
        if df.empty:
            return None
        
        # If date column exists, use line chart
        if "date" in df.columns or "created_at" in df.columns:
            date_col = "date" if "date" in df.columns else "created_at"
            value_cols = [c for c in df.columns if c != date_col]
            if value_cols:
                return px.line(df, x=date_col, y=value_cols[0], title=f"{value_cols[0]} Over Time")
        
        # If categorical data, use bar chart
        if len(df.columns) == 2:
            return px.bar(df, x=df.columns[0], y=df.columns[1])
        
        # Default to line chart
        return px.line(df)
    except ImportError:
        return None


def show_query_history() -> None:
    """Display query history/logs."""
    if "query_logs" not in st.session_state:
        st.session_state.query_logs = []

    if st.session_state.query_logs:
        logs_df = pd.DataFrame(st.session_state.query_logs)
        st.dataframe(logs_df, use_container_width=True)
    else:
        st.info("No queries yet. Run your first query to see logs here.")


def show_regression_analysis() -> None:
    """Display regression analysis modal with pre-generated charts."""
    from pathlib import Path

    # Check if regression analysis should be shown
    if st.session_state.get("show_regression_modal", False):

        # Create the modal content
        st.markdown("## 📊 Regression Analysis: Google Analytics vs Performance Metrics")
        st.markdown("---")

        # Add explanatory text
        st.markdown("""
        **Analysis Overview**: This regression analysis examines the relationship between Google Analytics
        active users and your business performance metrics (leads and sales). The charts below are based
        on aggregate metrics and are meant for demonstration purposes.
        """)

        # Create tabs for different views
        tab1, tab2, tab3 = st.tabs(["📈 Summary View", "👥 Active Users vs Leads", "💰 Active Users vs Sales"])

        with tab1:
            st.markdown("### Combined Regression Analysis")
            summary_path = Path("assets/static/ga_regression_summary.png")
            if summary_path.exists():
                st.image(str(summary_path), use_container_width=True)
            else:
                st.error("Summary chart not found. Please regenerate regression analysis.")

        with tab2:
            st.markdown("### Active Users vs Leads Generated")
            st.caption("This chart shows the correlation between daily active users and leads generated.")
            leads_path = Path("assets/static/ga_leads_regression.png")
            if leads_path.exists():
                st.image(str(leads_path), use_container_width=True)
            else:
                st.error("Leads regression chart not found. Please regenerate regression analysis.")

        with tab3:
            st.markdown("### Active Users vs Sales Closed")
            st.caption("This chart shows the correlation between daily active users and sales closed.")
            sales_path = Path("assets/static/ga_sales_regression.png")
            if sales_path.exists():
                st.image(str(sales_path), use_container_width=True)
            else:
                st.error("Sales regression chart not found. Please regenerate regression analysis.")

        st.markdown("---")

        # Key insights section
        with st.expander("🔍 Key Insights"):
            st.markdown("""
            **Correlation Analysis**:
            - The regression plots show the mathematical relationship between website traffic and business outcomes
            - R² values indicate how well the linear model fits the data
            - Higher R² values suggest stronger predictive relationships

            **Business Implications**:
            - Use these trends to forecast lead generation based on website traffic
            - Identify optimal traffic levels for sales conversion goals
            - Monitor deviations from expected patterns for early performance indicators
            """)

        # Close button
        col1, col2, col3 = st.columns([2, 1, 2])
        with col2:
            if st.button("Close Analysis", key="close_regression"):
                st.session_state.show_regression_modal = False
                st.rerun()


def show_regression_analysis_button() -> None:
    """Show the regression analysis button that triggers the modal."""
    if st.button("📊 Regression Analysis", key="regression_analysis_btn",
                help="View correlation analysis between Google Analytics data and business metrics"):
        st.session_state.show_regression_modal = True
        st.rerun()

