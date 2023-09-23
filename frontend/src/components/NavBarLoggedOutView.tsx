import { Button } from "react-bootstrap";
import styles from '../styles/Button.module.css';

interface NavBarLoggedOutViewProps {
    onSignUpClicked: () => void,
    onLoginClicked: () => void,
}

const NavBarLoggedOutView = ({ onSignUpClicked, onLoginClicked }: NavBarLoggedOutViewProps) => {
    return (
        <>
            <Button className={styles.button} onClick={onSignUpClicked}>Sign Up</Button>
            <Button className={styles.button} onClick={onLoginClicked}>Log In</Button>
        </>
    );
}



export default NavBarLoggedOutView;