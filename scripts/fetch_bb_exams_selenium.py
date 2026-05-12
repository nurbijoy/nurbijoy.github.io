#!/usr/bin/env python3
"""
Bangladesh Bank Exam Scraper (Selenium Version)
This script uses Selenium to bypass website protection and fetch exam schedules.

Requirements:
    pip install selenium webdriver-manager PyPDF2

Usage:
    python scripts/fetch_bb_exams_selenium.py
"""

import json
import re
from datetime import datetime
from pathlib import Path
import time

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    from webdriver_manager.chrome import ChromeDriverManager
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False
    print("⚠️  Selenium not installed. Install with: pip install selenium webdriver-manager")

# Configuration
BB_URL = "https://erecruitment.bb.org.bd/career/jobopportunity_bscs.php"
OUTPUT_FILE = Path(__file__).parent.parent / "public" / "data" / "bb-exams.json"

def setup_driver():
    """Setup Chrome driver with options"""
    if not SELENIUM_AVAILABLE:
        return None
    
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # Run in background
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        return driver
    except Exception as e:
        print(f"Error setting up Chrome driver: {e}")
        return None

def fetch_exam_list_selenium():
    """Fetch exam list using Selenium"""
    print("Setting up browser...")
    driver = setup_driver()
    
    if not driver:
        print("❌ Could not setup browser driver")
        return []
    
    try:
        print(f"Loading page: {BB_URL}")
        driver.get(BB_URL)
        
        # Wait for page to load
        time.sleep(3)
        
        print("Searching for exam data...")
        
        # Try to find table rows
        rows = driver.find_elements(By.TAG_NAME, "tr")
        
        exams = []
        
        for row in rows:
            try:
                cells = row.find_elements(By.TAG_NAME, "td")
                
                if len(cells) >= 4:
                    first_cell_text = cells[0].text.strip()
                    
                    # Check if this row contains seat plan
                    if 'Seat Plan for' in first_cell_text or 'seat plan' in first_cell_text.lower():
                        # Extract job ID
                        job_id_match = re.search(r'(\d{5})', first_cell_text)
                        if not job_id_match:
                            continue
                        
                        job_id = job_id_match.group(1)
                        
                        # Extract title
                        title = first_cell_text.replace('Seat Plan for', '').strip()
                        
                        # Try to find PDF link
                        pdf_link = None
                        try:
                            link = cells[1].find_element(By.TAG_NAME, "a")
                            pdf_link = link.get_attribute('href')
                        except:
                            pass
                        
                        # Extract dates
                        publish_date = cells[2].text.strip() if len(cells) > 2 else ""
                        exam_date = cells[3].text.strip() if len(cells) > 3 else ""
                        
                        exam_info = {
                            'id': job_id,
                            'title': title,
                            'jobId': job_id,
                            'pdfUrl': pdf_link,
                            'publishDate': publish_date,
                            'examDate': exam_date,
                            'rawText': first_cell_text
                        }
                        
                        exams.append(exam_info)
                        print(f"✓ Found: {job_id} - {title[:50]}...")
            
            except Exception as e:
                continue
        
        return exams
    
    except Exception as e:
        print(f"Error fetching data: {e}")
        return []
    
    finally:
        driver.quit()
        print("Browser closed")

def enrich_exam_data(exam_info):
    """Enrich exam information"""
    # Extract grade
    grade_match = re.search(r'Grade[- ](\d+)', exam_info['title'], re.IGNORECASE)
    grade = f"Grade-{grade_match.group(1)}" if grade_match else "N/A"
    
    # Parse exam date
    exam_date = exam_info.get('examDate', '')
    exam_day = ''
    exam_time = 'TBA'
    
    if exam_date:
        try:
            date_obj = datetime.strptime(exam_date, '%d/%m/%Y')
            exam_date = date_obj.strftime('%d %B %Y')
            exam_day = date_obj.strftime('%A')
        except:
            pass
    
    return {
        'id': exam_info['id'],
        'title': exam_info['title'],
        'jobId': exam_info['jobId'],
        'grade': grade,
        'examDate': exam_date,
        'examDay': exam_day,
        'examTime': exam_time,
        'noticeNo': f"BSCS Notice - Job ID {exam_info['jobId']}",
        'pdfUrl': exam_info.get('pdfUrl', ''),
        'centers': []
    }

def main():
    """Main function"""
    print("=" * 60)
    print("Bangladesh Bank Exam Scraper (Selenium)")
    print("=" * 60)
    
    if not SELENIUM_AVAILABLE:
        print("\n❌ Selenium is not installed!")
        print("\nTo install:")
        print("  pip install selenium webdriver-manager")
        print("\nAlternatively, use manual update:")
        print("  See: scripts/manual_update_guide.md")
        return
    
    # Fetch exam list
    exams = fetch_exam_list_selenium()
    
    if not exams:
        print("\n⚠️  No exams found!")
        print("\nPossible reasons:")
        print("  1. Website structure has changed")
        print("  2. No seat plans currently available")
        print("  3. Website is blocking automated access")
        print("\n💡 Solution: Use manual update")
        print("  See: scripts/manual_update_guide.md")
        return
    
    print(f"\n✓ Found {len(exams)} exam(s)")
    
    # Process exams
    processed_exams = []
    
    for exam_info in exams:
        enriched = enrich_exam_data(exam_info)
        processed_exams.append(enriched)
        print(f"  • {enriched['jobId']}: {enriched['title'][:50]}...")
    
    # Create output
    output_data = {
        'lastUpdated': datetime.now().isoformat() + 'Z',
        'exams': processed_exams
    }
    
    # Save to file
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'=' * 60}")
    print(f"✅ Updated: {OUTPUT_FILE}")
    print(f"{'=' * 60}")
    print("\n⚠️  Note: Center data not extracted (requires PDF parsing)")
    print("Please manually add center information from the PDF")
    print("See: scripts/manual_update_guide.md")

if __name__ == "__main__":
    main()
