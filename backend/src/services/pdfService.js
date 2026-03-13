const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class PdfService {
    constructor() {
        this.tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    /**
     * Generates a PDF from HTML content
     * @param {string} htmlContent - The HTML content to render
     * @param {string} invoiceId - The invoice ID for naming
     * @returns {Promise<{filePath: string, fileName: string}>}
     */
    async generateInvoicePdf(htmlContent, invoiceId) {
        let browser = null;
        try {
            console.log(`[PdfService] Generating PDF for invoice ${invoiceId}...`);
            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            
            // Set content
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
            
            // Generate PDF
            const fileName = `invoice-${invoiceId}-${Date.now()}.pdf`;
            const filePath = path.join(this.tempDir, fileName);
            
            await page.pdf({
                path: filePath,
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20px',
                    bottom: '20px',
                    left: '20px',
                    right: '20px'
                }
            });

            console.log(`[PdfService] PDF generated successfully: ${filePath}`);
            return { filePath, fileName };
        } catch (error) {
            console.error('[PdfService] Error generating PDF:', error);
            throw error;
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
    
    /**
     * Deletes a file from the filesystem
     * @param {string} filePath - Path to the file to delete
     */
    deleteFile(filePath) {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) console.error('[PdfService] Error deleting temp PDF:', err);
                else console.log(`[PdfService] Deleted temp file: ${filePath}`);
            });
        }
    }
}

module.exports = new PdfService();
