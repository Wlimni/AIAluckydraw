#!/usr/bin/env python3
"""
Excel Data Extractor for AIA Lucky Draw System
Extracts worker data from the Excel file and generates JavaScript data structure
"""

import pandas as pd
import json
import sys
import os

def extract_excel_data(excel_path):
    """Extract data from the Excel file and return structured data"""
    
    print(f"Reading Excel file: {excel_path}")
    
    try:
        # Read the Excel file with multiple sheets
        excel_data = pd.read_excel(excel_path, sheet_name=None, engine='openpyxl')
        
        print(f"Available sheets: {list(excel_data.keys())}")
        
        # Initialize data structures
        workers_data = {}
        agencies_data = {}
        
        # Extract from "Generation" sheet
        if 'Generation' in excel_data:
            generation_sheet = excel_data['Generation']
            print(f"\nGeneration sheet columns: {list(generation_sheet.columns)}")
            print(f"Generation sheet shape: {generation_sheet.shape}")
            
            # Show first 10 rows to understand structure
            print("\nFirst 10 rows of generation sheet:")
            print(generation_sheet.head(10).to_string())
            
        # Extract from "Eligible Agent" sheet  
        eligible_sheets = [sheet for sheet in excel_data.keys() if 'eligible' in sheet.lower() and 'agent' in sheet.lower()]
        if eligible_sheets:
            eligible_sheet_name = eligible_sheets[0]
            eligible_sheet = excel_data[eligible_sheet_name]
            print(f"\nEligible agent sheet ({eligible_sheet_name}) columns: {list(eligible_sheet.columns)}")
            print(f"Eligible agent sheet shape: {eligible_sheet.shape}")
            
            # Show first 10 rows to understand structure
            print(f"\nFirst 10 rows of {eligible_sheet_name} sheet:")
            print(eligible_sheet.head(10).to_string())
        
        return excel_data
        
    except Exception as e:
        print(f"Error reading Excel file: {e}")
        return None

def process_worker_data(excel_data, agent_name_col, group_no_col, lay_see_amount_col):
    """Process worker data based on specified columns from Generation sheet"""
    
    generation_sheet = excel_data['Generation']
    
    workers = {}
    
    # Process each row in the generation sheet
    # Multiple rows for one person means multiple tickets/prizes
    for index, row in generation_sheet.iterrows():
        if pd.isna(row[agent_name_col]) or pd.isna(row[group_no_col]):
            continue
            
        agent_name = str(row[agent_name_col]).strip()
        group_no = str(row[group_no_col]).strip()
        lay_see_amount = str(row[lay_see_amount_col]).strip() if not pd.isna(row[lay_see_amount_col]) else None
        
        # Create group if not exists
        if group_no not in workers:
            workers[group_no] = {}
        
        # Create worker if not exists
        if agent_name not in workers[group_no]:
            workers[group_no][agent_name] = {
                'name': agent_name,
                'group_no': group_no,
                'lay_see_amounts': [],
                'tickets': 0
            }
        
        # Add lay see amount if exists (each row = 1 ticket)
        if lay_see_amount and lay_see_amount != 'nan':
            workers[group_no][agent_name]['lay_see_amounts'].append(lay_see_amount)
        
        # Each row represents one ticket for this person
        workers[group_no][agent_name]['tickets'] += 1
    
    return workers

def process_agency_data(excel_data, group_no_col, family_col, agent_name_col, agency_code_col, district_col):
    """Process agency data based on specified columns from Eligible Agent sheet"""
    
    # Find eligible agent sheet
    eligible_sheets = [sheet for sheet in excel_data.keys() if 'eligible' in sheet.lower() and 'agent' in sheet.lower()]
    if not eligible_sheets:
        return {}
    
    eligible_sheet = excel_data[eligible_sheets[0]]
    
    agencies = {}
    group_families = {}
    
    # Process each row in the eligible agent sheet
    for index, row in eligible_sheet.iterrows():
        if pd.isna(row[group_no_col]):
            continue
            
        group_no = str(row[group_no_col]).strip()
        family = str(row[family_col]).strip() if not pd.isna(row[family_col]) else ''
        agent_name = str(row[agent_name_col]).strip() if not pd.isna(row[agent_name_col]) else ''
        agency_code = str(row[agency_code_col]).strip() if not pd.isna(row[agency_code_col]) else ''
        district = str(row[district_col]).strip() if not pd.isna(row[district_col]) else ''
        
        # Store group to family mapping
        if group_no not in group_families:
            group_families[group_no] = {
                'family': family,
                'district': district,
                'agents': []
            }
        
        # Add agent info
        if agent_name:
            group_families[group_no]['agents'].append({
                'agent_name': agent_name,
                'agency_code': agency_code
            })
    
    return group_families

def generate_javascript_data(workers_data, group_families_data):
    """Generate JavaScript data structure for the player selection system"""
    
    js_groups = {}
    group_counter = 1
    
    for group_no, workers in workers_data.items():
        group_id = f"group-{group_counter}"
        
        # Get family and district info from group_families_data
        family_name = group_no  # Default to group number
        district_name = ""
        
        if group_no in group_families_data:
            family_info = group_families_data[group_no]
            family_name = family_info['family'] if family_info['family'] else group_no
            district_name = family_info['district']
        
        # Convert workers to the required format
        js_workers = []
        emp_counter = 1
        
        for agent_name, worker_info in workers.items():
            employee_id = f"EMP{group_counter:03d}{emp_counter:03d}"
            
            js_workers.append({
                'name': agent_name,
                'tickets': worker_info['tickets'],
                'employeeId': employee_id,
                'groupNo': group_no,
                'laySeAmounts': worker_info['lay_see_amounts']
            })
            emp_counter += 1
        
        # Create group data
        js_groups[group_id] = {
            'id': group_id,
            'name': family_name,
            'groupNo': group_no,
            'district': district_name,
            'icon': '👨‍👩‍👧‍👦',
            'description': f"{district_name} District" if district_name else f"Group {group_no}",
            'workers': js_workers
        }
        
        group_counter += 1
    
    return js_groups

def main():
    excel_path = "/Users/user/html/aia.luckdraw/aia-lucky-draw-wheel/assets/info/20250811 Lucky Money for Special Districts_Final.xlsm"
    
    if not os.path.exists(excel_path):
        print(f"Excel file not found: {excel_path}")
        return
    
    # Extract and show data structure first
    excel_data = extract_excel_data(excel_path)
    
    if excel_data is None:
        print("Failed to read Excel file")
        return
    
    print("\n" + "="*50)
    print("EXCEL DATA EXTRACTION COMPLETE")
    print("="*50)
    print("\nPlease specify the column names for:")
    print("Generation sheet:")
    print("1. Agent Name column")
    print("2. Group No. column")  
    print("3. Lay See amount column")
    print("\nEligible Agent sheet:")
    print("4. Group No. column")
    print("5. Family column")
    print("6. Agent name column")
    print("7. Agency code column")
    print("8. District column")
    print("\nExample usage:")
    print("python3 extract_excel_data.py 'Agent Name' 'Group No.' 'Lay See amount' 'Group No.' 'Family' 'Agent name' 'Agency code' 'District'")

if __name__ == "__main__":
    if len(sys.argv) == 9:
        # If column names are provided as arguments
        excel_path = "/Users/user/html/aia.luckdraw/aia-lucky-draw-wheel/assets/info/20250811 Lucky Money for Special Districts_Final.xlsm"
        
        # Generation sheet columns
        agent_name_col = sys.argv[1]
        group_no_col = sys.argv[2] 
        lay_see_amount_col = sys.argv[3]
        
        # Eligible Agent sheet columns
        eligible_group_no_col = sys.argv[4]
        family_col = sys.argv[5]
        eligible_agent_name_col = sys.argv[6]
        agency_code_col = sys.argv[7]
        district_col = sys.argv[8]
        
        excel_data = extract_excel_data(excel_path)
        if excel_data:
            workers_data = process_worker_data(excel_data, agent_name_col, group_no_col, lay_see_amount_col)
            group_families_data = process_agency_data(excel_data, eligible_group_no_col, family_col, eligible_agent_name_col, agency_code_col, district_col)
            js_data = generate_javascript_data(workers_data, group_families_data)
            
            # Output the JavaScript data
            print("\n" + "="*50)
            print("GENERATED JAVASCRIPT DATA")
            print("="*50)
            print(json.dumps(js_data, indent=2, ensure_ascii=False))
            
            # Save to file
            output_path = "/Users/user/html/aia.luckdraw/aia-lucky-draw-wheel/extracted_data.json"
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(js_data, f, indent=2, ensure_ascii=False)
            print(f"\nData saved to: {output_path}")
    else:
        main()
