import React from "react";
import './Profile.css';
import { motion } from 'framer-motion';
class Profile extends React.Component{

    render(){
        return(
            <div className="profile-container">
                <div className="left">
                    <img src="https://scontent.fhan14-1.fna.fbcdn.net/v/t39.30808-6/278459014_509313137537982_2783581271605951803_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeHIOS8L4oU5sCj_w1ZXc4vbaGImQH0vWWloYiZAfS9ZaVwpcSFI9fekfGlgAH0-LvGhKoWpkLDL4dMsMhHkopXS&_nc_ohc=BS40AAVyKlkQ7kNvgFC3Bvb&_nc_zt=23&_nc_ht=scontent.fhan14-1.fna&_nc_gid=ALACCxZCT7y_XENckDP5Hv0&oh=00_AYA0YTo8wtz3fqdP7idm-oszhJGB41PDfckSWsrZ0rLqbw&oe=67396D5F"
                    alt="profile"
                    className="profile-image"></img>
                </div>
                <div className="right">
                    <div className="text1">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}  // Ban đầu ẩn và nằm dưới
                        animate={{ opacity: 1, y: 0 }}   // Sau đó hiện lên và trở về vị trí ban đầu
                        transition={{ duration: 1 }}     // Thời gian hiệu ứng
                        >
                    <p><strong>Full Name: </strong> Nguyễn Chí Minh</p>
                    <p><strong>Student ID: </strong> B21DCCN525</p>
                    <p><strong>Class: </strong> D21CQCN09-B</p>
                    <p><strong>Email: </strong> minh69125@gmail.com</p>
                    <p><strong>Github: </strong><a href="https://github.com/spmon/IOT-template"> https://github.com/spmon/IOT-template</a></p>
                    <p><strong>Báo cáo: </strong><a href="https://drive.google.com/drive/folders/1ksWeiNYNErwOSPTnXD6qfImwqoKn8rrK">Báo cáo tổng thể</a></p>
                    </motion.div>
                    </div>
                </div>
            </div>
        )
    }
}
export default Profile;