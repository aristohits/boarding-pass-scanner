const codeReader = new ZXing.BrowserPDF417Reader();
let selectedDeviceId;
const videoElement = document.getElementById('video');
const resultDrawer = document.getElementById('result-drawer');
const errorOverlay = document.getElementById('error-message');
const errorText = document.getElementById('error-text');

// BCBP Parser based on IATA 791
function parseBCBP(data) {
    try {
        // Format Code: 'M' for multiple, 'S' for single (1st char)
        // Name: Chars 2-21 (20 chars)
        const name = data.substring(2, 22).trim();
        
        // PNR: Chars 23-29 (7 chars)
        
        // From/To: Chars 30-32 (3 chars), 33-35 (3 chars)
        const from = data.substring(30, 33).trim();
        const to = data.substring(33, 36).trim();
        
        // Carrier + Flight Number: Chars 36-43 (8 chars)
        const flight = data.substring(36, 44).trim();

        // Julian Date: Chars 44-46 (3 chars)
        const julianDate = data.substring(44, 47).trim();
        
        // Compartment Code (Class): Char 47 (1 char)
        const classCode = data.substring(47, 48);
        const classMap = {
            'Y': 'Economy',
            'J': 'Business',
            'F': 'First Class',
            // Common additional codes
            'C': 'Business',
            'P': 'First Class',
            'M': 'Economy',
            'B': 'Economy'
        };
        const flightClass = classMap[classCode] || 'Economy';

        // Seat: Chars 48-51 (4 chars)
        const seat = data.substring(48, 52).trim();

        // Boarding Time: Chars 80-83 (4 chars) - may vary in position if optional fields are skipped
        // Standard position for Boarding Time is 80-83 if security data length is not present yet
        // Let's try to extract it cautiously
        let boardingTime = 'N/A';
        if (data.length >= 84) {
            boardingTime = data.substring(80, 84).trim();
        }

        // Check if data seems valid (starts with 'M' or 'S' and has minimum length)
        if (!['M', 'S'].includes(data.charAt(0)) || data.length < 60) {
            throw new Error('Invalid Boarding Pass format');
        }

        return {
            name,
            from,
            to,
            flight,
            date: julianDate,
            flightClass,
            seat,
            boardingTime,
            raw: data
        };
    } catch (e) {
        console.error('Parsing error:', e);
        return null;
    }
}

async function initScanner() {
    try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        
        if (videoInputDevices.length === 0) {
            showError('No cameras found on this device.');
            return;
        }

        // Prefer back camera
        const backCamera = videoInputDevices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('environment')
        );
        
        selectedDeviceId = backCamera ? backCamera.deviceId : videoInputDevices[0].deviceId;
        startScanning();

    } catch (err) {
        console.error(err);
        showError('Permission denied or camera error.');
    }
}

function startScanning() {
    codeReader.decodeFromVideoDevice(selectedDeviceId, 'video', (result, err) => {
        if (result) {
            const parsed = parseBCBP(result.text);
            if (parsed) {
                showResult(parsed);
                codeReader.reset(); // Stop scanning once we have a result
            }
        }
        if (err && !(err instanceof ZXing.NotFoundException)) {
            console.error(err);
        }
    });
}

// Helper to convert Julian Date (DDD) to Human Readable Date
function formatJulianDate(julianStr) {
    const dayOfYear = parseInt(julianStr, 10);
    if (isNaN(dayOfYear) || dayOfYear < 1 || dayOfYear > 366) return 'N/A';

    const date = new Date();
    const currentYear = date.getFullYear();
    
    // Create date object for Jan 1st of current year
    const targetDate = new Date(currentYear, 0, 1);
    // Add the days (Julian Date is 1-based, so subtract 1)
    targetDate.setDate(dayOfYear);

    return targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function showResult(data) {
    document.getElementById('res-name').textContent = data.name || 'Unknown';
    document.getElementById('res-flight').textContent = data.flight || 'N/A';
    document.getElementById('res-class').textContent = data.flightClass || 'Economy';
    
    // Remove leading zeros from seat (e.g., 019A -> 19A)
    const displaySeat = (data.seat || 'N/A').replace(/^0+/, '');
    document.getElementById('res-seat').textContent = displaySeat || 'N/A';
    
    document.getElementById('res-from').textContent = data.from || '---';
    document.getElementById('res-to').textContent = data.to || '---';
    document.getElementById('res-date').textContent = formatJulianDate(data.date);
    document.getElementById('res-boarding').textContent = data.boardingTime || '---';

    document.getElementById('res-raw').textContent = data.raw;
    
    resultDrawer.classList.remove('translate-y-full');
    document.getElementById('raw-data-container').classList.remove('hidden');
}

function showError(msg) {
    errorText.textContent = msg;
    errorOverlay.classList.remove('hidden');
}

document.getElementById('scan-again').addEventListener('click', () => {
    resultDrawer.classList.add('translate-y-full');
    startScanning();
});

document.getElementById('toggle-camera').addEventListener('click', async () => {
    const videoInputDevices = await codeReader.listVideoInputDevices();
    if (videoInputDevices.length > 1) {
        const currentIndex = videoInputDevices.findIndex(d => d.deviceId === selectedDeviceId);
        const nextIndex = (currentIndex + 1) % videoInputDevices.length;
        selectedDeviceId = videoInputDevices[nextIndex].deviceId;
        codeReader.reset();
        startScanning();
    }
});

// Initialize on load
window.addEventListener('load', initScanner);
