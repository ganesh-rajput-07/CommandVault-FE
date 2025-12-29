import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import Navbar from "../components/Navbar";
import useNotifications from "../hooks/useNotifications";
import "./QRScanner.css";
import LoadingSpinner from "../components/LoadingSpinner";

export default function QRScanner() {
    const navigate = useNavigate();
    const { unreadCount } = useNotifications();
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let scanner = null;

        const onScanSuccess = (decodedText, decodedResult) => {
            // Handle success
            setScanResult(decodedText);

            // Check if it is a valid CommandVault URL
            if (decodedText.includes('/prompt/')) {
                // Extract slug or path
                try {
                    const url = new URL(decodedText);
                    // navigate to the path
                    navigate(url.pathname + url.search);
                } catch (e) {
                    // If it's relative or just a string
                    if (decodedText.startsWith('/')) {
                        navigate(decodedText);
                    } else {
                        setError("Invalid QR Code format");
                    }
                }
            } else {
                setError("This QR code is not for CommandVault");
            }

            if (scanner) {
                scanner.clear().catch(err => console.error("Failed to clear scanner", err));
            }
        };

        const onScanFailure = (error) => {
            // handle scan failure, usually better to ignore as it triggers on every frame
            // console.warn(`Code scan error = ${error}`);
        };

        try {
            scanner = new Html5QrcodeScanner(
                "reader",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                /* verbose= */ false
            );
            scanner.render(onScanSuccess, onScanFailure);
        } catch (err) {
            console.error("Error initializing scanner:", err);
            setError("Failed to initialize camera. Please ensure permissions are granted.");
        }

        return () => {
            if (scanner) {
                scanner.clear().catch(error => {
                    console.error("Failed to clear html5-qrcode scanner. ", error);
                });
            }
        };
    }, [navigate]);

    return (
        <>
            <Navbar unreadCount={unreadCount} />
            <div className="scanner-container">
                <div className="scanner-card">
                    <h2>Scan QR Code</h2>
                    <p className="scanner-instruction">Point your camera at a CommandVault QR code to unlock content.</p>

                    {error && (
                        <div className="scanner-error">
                            {error}
                        </div>
                    )}

                    <div id="reader" className="qr-reader-box"></div>

                    <button className="back-btn" onClick={() => navigate(-1)}>
                        Cancel
                    </button>
                </div>
            </div>
        </>
    );
}
