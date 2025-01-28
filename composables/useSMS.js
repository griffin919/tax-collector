export const useSMS = () => {
    const config = useRuntimeConfig();
    const endPoint = 'https://api.mnotify.com/api/sms/quick';
    const apiKey = "sfqJCTxlnVp5COjIdiEGLZrXp";

    // Utility function to clean and format phone numbers
    const cleanPhoneNumber = (phone) => {
        if (phone === null || phone === undefined) return '';
        
        // Convert to string if number is passed
        const phoneString = String(phone);
        
        // Remove all non-digit characters
        return phoneString.replace(/\D/g, '');
    };

    // Validates various international phone number formats
    const isValidInternationalPhone = (phone) => {
        if (!phone) return false;

        try {
            // Clean the phone number first
            const cleaned = cleanPhoneNumber(phone);
            const phoneString = String(phone);

            // If number starts with '+' or '00'
            if (phoneString.startsWith('+') || phoneString.startsWith('00')) {
                return cleaned.length >= 8 && cleaned.length <= 15;
            }

            // For local numbers (Ghana)
            if (phoneString.startsWith('0')) {
                return cleaned.length === 10;
            }

            return cleaned.length >= 8 && cleaned.length <= 15;
        } catch (error) {
            console.error('Phone validation error:', error);
            return false;
        }
    };

    // Format phone number to international format
    const formatToInternational = (phone) => {
        try {
            const cleaned = cleanPhoneNumber(phone);
            const phoneString = String(phone);

            // If already in international format, return as is
            if (phoneString.startsWith('+')) {
                return phoneString;
            }

            // Handle Ghana numbers
            if (cleaned.startsWith('0')) {
                return '+233' + cleaned.substring(1);
            }

            // Handle numbers starting with country code
            if (cleaned.startsWith('233')) {
                return '+' + cleaned;
            }

            // For other international numbers that don't start with +
            if (cleaned.length >= 8) {
                return '+' + cleaned;
            }

            return phoneString;
        } catch (error) {
            console.error('Phone formatting error:', error);
            return phone;
        }
    };

    const formatCurrency = (amount) => {
        try {
            if (!amount) return '0.00';
            const num = parseFloat(amount);
            if (isNaN(num)) return '0.00';
            return num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        } catch (error) {
            console.error('Currency formatting error:', error);
            return '0.00';
        }
    };

    const formatDate = (date) => {
        try {
            if (!date) return '';
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) return '';
            
            return dateObj.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Date formatting error:', error);
            return '';
        }
    };

    const sendSMS = async (name, contact, taxType, date, amount, isUpdate = false) => {
        try {
            // Validate required parameters
            if (!contact) {
                throw new Error('Contact number is required');
            }

            // Validate phone number format
            if (!isValidInternationalPhone(contact)) {
                throw new Error('Invalid phone number format. Please enter a valid international phone number.');
            }

            // Format the phone number
            const formattedContact = formatToInternational(contact);
            const formattedAmount = formatCurrency(amount);
            const formattedDate = formatDate(date);

            if (!formattedDate) {
                throw new Error('Invalid date format');
            }

            // Construct SMS message
            const message = isUpdate
                ? `Dear ${name}, your payment has been updated. Current amount: GHS ${formattedAmount} for  ${taxType} on ${formattedDate}. Thank you. For complaints call 0246790052`
                : `Dear ${name}, your payment of GHS ${formattedAmount} for ${taxType} on ${formattedDate} has been received. Thank you. For complaints call 0246790052`;

            const data = {
                recipient: [formattedContact],
                sender: 'RigelisInc',
                message: message,
                is_schedule: false,
                schedule_date: ''
            };

            if (!endPoint || !apiKey) {
                throw new Error('SMS API configuration is missing');
            }

            const url = `${endPoint}?key=${apiKey}`;

            const response = await $fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.status === 'success' || response.code === 200) {
                return {
                    success: true,
                    message: 'SMS sent successfully'
                };
            } else {
                throw new Error(response.message || 'Failed to send SMS');
            }

        } catch (error) {
            console.error('SMS Error:', {
                message: error.message,
                response: error.response,
                data: error.data,
                stack: error.stack
            });

            return {
                success: false,
                message: error.message || 'Failed to send SMS. Please try again later.'
            };
        }
    };

    return {
        sendSMS,
        isValidInternationalPhone,
        formatToInternational,
        cleanPhoneNumber
    };
};