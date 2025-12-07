import { useEffect } from 'react';
import { HiCheckCircle, HiXCircle, HiInformationCircle, HiX } from 'react-icons/hi';

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    if (!message) return null;

    const styles = {
        success: 'bg-green-50 text-green-800 border-green-200',
        error: 'bg-red-50 text-red-800 border-red-200',
        info: 'bg-blue-50 text-blue-800 border-blue-200',
    };

    const icons = {
        success: <HiCheckCircle className="w-5 h-5 text-green-500" />,
        error: <HiXCircle className="w-5 h-5 text-red-500" />,
        info: <HiInformationCircle className="w-5 h-5 text-blue-500" />,
    };

    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg border shadow-lg transition-all transform duration-300 ease-in-out ${styles[type] || styles.info}`}>
            <div className="mr-3">
                {icons[type] || icons.info}
            </div>
            <div className="text-sm font-medium mr-8">
                {message}
            </div>
            <button
                onClick={onClose}
                className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-white hover:bg-opacity-20 focus:outline-none"
            >
                <HiX className="w-4 h-4" />
            </button>
        </div>
    );
}
