import AvatarUpload from "../components/AvatarUpload";

// New Profile page component
const Profile = () => {
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>

            <AvatarUpload />

       
            
        </div>
    );
};

// Makes the file publicly available for the main App component to import and use
export default Profile;