import { useState, useRef, useEffect } from "react";

// New Avatar upload component
const AvatarUpload = () => {
    // profileImage: Holds the URL to the image.
    // setProfileImage: The function that updates "profileImage".
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref to access the hidden file input element

    // TODO: Backend Integration: Get profile image from database and update the profile image.
    // Purpose: When the component first loads, fetch the user's saved image URL from the database.
    useEffect(() => {
        const fetchProfileImage = async () => {
            try {
                console.log("TODO: Fetch image from backend API here.");
            } catch (error) {
                console.error("Error fetching profile image:", error);
            }
        };
        fetchProfileImage();
    }, []);


    // This function reads a selected image file and updates the profileImage state with its data URL.
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            const reader = new FileReader();

            // Updates the profileImage once the file is read successfully.
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };

            // Reads the file as a data URL.
            reader.readAsDataURL(file);

            try {
                const formData = new FormData(); // Digital envelope to send image file to backend.
                formData.append('profileImage', file); // 'profileImage' is the "key" the backend looks for

                /*TODO: Send Image to backend for storage. 
                Send formData to backend.
                const response = await fetch('/api/user/profile-picture', {
                    method: 'POST',
                    body: formData,
                });

                // Wait for backend to respond.
                if (response.ok) {
                    console.log("Success");
                }

                // Verify.
                catch (error) {
                    console.error("Error:", error);
                }
                */

                console.log("TODO: Send file to backend. Backend handles deleting the old file.");

            } catch (error) {
                console.error("Network error sending image:", error);
            }
        }
    }; // End of handleImageUpload function.


    const handleCircleClick = () => {
        fileInputRef.current?.click();
    };


    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px'
        }}>
            <div
                style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%', // Makes the square div into a circle.
                    border: '2px solid var(--accent)',
                    backgroundColor: 'var(--social-bg)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'transform 0.3s ease'
                }}

                onClick={handleCircleClick}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
                {/* Checks if there is an existing profile image, if not use the silhouette emoji as a placeholder. */}
                {profileImage ? (
                    <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <span style={{ fontSize: '2rem', opacity: 0.5 }}>👤</span>
                )}

                <div style={{
                    position: 'absolute',
                    bottom: '0',
                    width: '100%',
                    background: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    fontSize: '0.7rem',
                    padding: '4px 0',
                    textAlign: 'center'
                }}>EDIT</div>
            </div>

            {/* Hidden Input using the ref */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
            />

            <h2 style={{ color: 'var(--text-h)', margin: 0 }}>Member Name</h2>
            <p>weight: 130</p>
            <p>email: user@example.com</p>
            <p>age: 21 </p>

        </div>
    );
};

// Makes the file publicly available for the main App component to import and use
export default AvatarUpload;