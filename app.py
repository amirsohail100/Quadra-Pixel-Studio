import os
import sys
import webview

def get_resource_path(relative_path):
    """PyInstaller ke baad files ka sahi path nikalne ke liye"""
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)

if __name__ == '__main__':
    # यहाँ सुधार करना है (web के अंदर सीधे index.html)
    html_file = get_resource_path(os.path.join('static', 'index.html'))
    
    window = webview.create_window(
        title='Quadra Pixel',
        url=html_file,
        width=700,
        height=600,
        resizable=True
    )
    webview.start()