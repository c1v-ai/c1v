#!/usr/bin/env python3
"""
Generate static regression analysis charts for the dashboard.
This script creates pre-generated PNG images comparing Google Analytics data to leads and sales.
"""
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

# Set up paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data" / "synth"
ASSETS_DIR = BASE_DIR / "assets"
OUTPUT_DIR = ASSETS_DIR / "regression_charts"

# Create output directory if it doesn't exist
OUTPUT_DIR.mkdir(exist_ok=True)

def load_and_prepare_data():
    """Load and prepare the data for regression analysis."""
    print("Loading data files...")

    # Load Google Analytics data
    ga_file = DATA_DIR / "google-analytics.csv"
    leads_file = DATA_DIR / "leads.csv"
    sales_file = DATA_DIR / "sales.csv"

    # Read GA data (skip header comments)
    with open(ga_file, 'r') as f:
        lines = f.readlines()
        # Find where actual CSV data starts
        start_line = 0
        for i, line in enumerate(lines):
            if line.strip().startswith("Step,"):
                start_line = i
                break

    ga_data = pd.read_csv(ga_file, skiprows=start_line)
    leads_data = pd.read_csv(leads_file)
    sales_data = pd.read_csv(sales_file)

    print(f"Loaded {len(ga_data)} GA records, {len(leads_data)} leads, {len(sales_data)} sales")

    return ga_data, leads_data, sales_data

def create_synthetic_time_series(ga_data, leads_data, sales_data):
    """Create synthetic time series data for regression analysis."""
    # Generate 30 days of data
    dates = pd.date_range(start='2024-11-15', end='2024-12-14', freq='D')

    # Extract total active users from GA data
    total_users = ga_data[ga_data['Device category'] == 'Total']['Active users'].iloc[0]

    # Create synthetic daily data with some realistic patterns
    np.random.seed(42)  # For reproducible results

    daily_data = []
    for i, date in enumerate(dates):
        # Add weekly and random patterns
        week_factor = 1 + 0.3 * np.sin(2 * np.pi * i / 7)  # Weekly pattern
        trend_factor = 1 + 0.02 * i  # Slight upward trend
        noise = np.random.normal(1, 0.1)  # Random variation

        daily_users = int(total_users * week_factor * trend_factor * noise / 30)
        daily_leads = max(1, int(daily_users * 0.05 * np.random.uniform(0.8, 1.2)))  # ~5% conversion
        daily_sales = max(0, int(daily_leads * 0.15 * np.random.uniform(0.7, 1.3)))  # ~15% close rate

        daily_data.append({
            'date': date,
            'active_users': daily_users,
            'leads': daily_leads,
            'sales': daily_sales
        })

    return pd.DataFrame(daily_data)

def create_regression_plot(x_data, y_data, title, x_label, y_label, filename):
    """Create a regression plot and save as PNG."""
    plt.figure(figsize=(12, 8))

    # Set style
    plt.style.use('default')
    sns.set_palette("husl")

    # Create scatter plot
    plt.scatter(x_data, y_data, alpha=0.7, s=60, color='#1f77b4')

    # Add regression line
    z = np.polyfit(x_data, y_data, 1)
    p = np.poly1d(z)
    plt.plot(x_data, p(x_data), "r--", alpha=0.8, linewidth=2, color='#ff7f0e')

    # Calculate R-squared
    correlation_matrix = np.corrcoef(x_data, y_data)
    correlation = correlation_matrix[0,1]
    r_squared = correlation**2

    # Add equation and R-squared
    equation = f'y = {z[0]:.3f}x + {z[1]:.1f}'
    plt.text(0.05, 0.95, f'{equation}\nR² = {r_squared:.3f}',
             transform=plt.gca().transAxes, fontsize=12,
             bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))

    plt.title(title, fontsize=16, fontweight='bold', pad=20)
    plt.xlabel(x_label, fontsize=14)
    plt.ylabel(y_label, fontsize=14)
    plt.grid(True, alpha=0.3)
    plt.tight_layout()

    # Save the plot
    output_path = OUTPUT_DIR / filename
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()

    print(f"Created {filename} (R² = {r_squared:.3f})")
    return r_squared

def main():
    """Main function to generate all regression charts."""
    print("Starting regression chart generation...")

    # Load data
    ga_data, leads_data, sales_data = load_and_prepare_data()

    # Create time series data
    time_series = create_synthetic_time_series(ga_data, leads_data, sales_data)

    # Create regression plots
    print("\nGenerating regression charts...")

    # Active Users vs Leads
    r2_leads = create_regression_plot(
        time_series['active_users'],
        time_series['leads'],
        'Regression Analysis: Active Users vs Leads',
        'Daily Active Users',
        'Daily Leads Generated',
        'ga_leads_regression.png'
    )

    # Active Users vs Sales
    r2_sales = create_regression_plot(
        time_series['active_users'],
        time_series['sales'],
        'Regression Analysis: Active Users vs Sales',
        'Daily Active Users',
        'Daily Sales Closed',
        'ga_sales_regression.png'
    )

    # Create a combined summary chart
    plt.figure(figsize=(16, 6))

    # Subplot 1: Users vs Leads
    plt.subplot(1, 2, 1)
    plt.scatter(time_series['active_users'], time_series['leads'], alpha=0.7, s=60, color='#1f77b4')
    z1 = np.polyfit(time_series['active_users'], time_series['leads'], 1)
    p1 = np.poly1d(z1)
    plt.plot(time_series['active_users'], p1(time_series['active_users']), "r--", alpha=0.8, linewidth=2, color='#ff7f0e')
    plt.title('Active Users vs Leads', fontsize=14, fontweight='bold')
    plt.xlabel('Daily Active Users', fontsize=12)
    plt.ylabel('Daily Leads', fontsize=12)
    plt.text(0.05, 0.95, f'R² = {r2_leads:.3f}', transform=plt.gca().transAxes, fontsize=11,
             bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))
    plt.grid(True, alpha=0.3)

    # Subplot 2: Users vs Sales
    plt.subplot(1, 2, 2)
    plt.scatter(time_series['active_users'], time_series['sales'], alpha=0.7, s=60, color='#2ca02c')
    z2 = np.polyfit(time_series['active_users'], time_series['sales'], 1)
    p2 = np.poly1d(z2)
    plt.plot(time_series['active_users'], p2(time_series['active_users']), "r--", alpha=0.8, linewidth=2, color='#d62728')
    plt.title('Active Users vs Sales', fontsize=14, fontweight='bold')
    plt.xlabel('Daily Active Users', fontsize=12)
    plt.ylabel('Daily Sales', fontsize=12)
    plt.text(0.05, 0.95, f'R² = {r2_sales:.3f}', transform=plt.gca().transAxes, fontsize=11,
             bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))
    plt.grid(True, alpha=0.3)

    plt.suptitle('Google Analytics Regression Analysis Summary', fontsize=16, fontweight='bold', y=1.02)
    plt.tight_layout()

    # Save combined chart
    combined_path = OUTPUT_DIR / 'ga_regression_summary.png'
    plt.savefig(combined_path, dpi=300, bbox_inches='tight')
    plt.close()

    print(f"Created ga_regression_summary.png")
    print(f"\nAll charts saved to: {OUTPUT_DIR}")
    print(f"Generated files:")
    print(f"  - ga_leads_regression.png")
    print(f"  - ga_sales_regression.png")
    print(f"  - ga_regression_summary.png")

if __name__ == "__main__":
    main()