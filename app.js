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
        
        // Carrier + Flight Number: Chars 36-43 (8 chars)
        const flight = data.substring(36, 44).trim();
        
        // Seat: Chars 48-51 (4 chars)
        const seat = data.substring(48, 52).trim();

        // Check if data seems valid (starts with 'M' or 'S' and has minimum length)
        if (!['M', 'S'].includes(data.charAt(0)) || data.length < 60) {
            throw new Error('Invalid Boarding Pass format');
        }

        return {
            name,
            flight,
            seat,
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

function showResult(data) {
    document.getElementById('res-name').textContent = data.name || 'Unknown';
    document.getElementById('res-flight').textContent = data.flight || 'N/A';
    document.getElementById('res-seat').textContent = data.seat || 'N/A';
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
