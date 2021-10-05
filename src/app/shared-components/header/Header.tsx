import * as React from 'react';
import { subscribeNotification, Notification, hasSubscribeNotification } from '../../services/notification-service';
import './Header.scss';

interface IAuth0Profile {
    iss: string;
    picture: string;
    name: string;
    nickname: string;
    sub: string;
    updated_at: string;
}

interface Props {

}

export const Header: React.FunctionComponent<Props> = (props) => {

    const [profile, setProfile] = React.useState({} as IAuth0Profile | null);

    React.useEffect(() => {

        window.api.receive("profile", (profile) => {
            setProfile(profile);
        });

        const hide = () => {
            const elements = document.getElementsByClassName('notification-container');

            if (elements.length === 0) {
                return;
            }

            elements[0].classList.remove('notification-container-show');
            elements[0].classList.remove('notification-container-hidden');
            elements[0].innerHTML = "";
        }

        if (hasSubscribeNotification() === false) {
            subscribeNotification((notification: Notification) => {
                let timeout = 4000;

                if (notification.timeout) {
                    timeout = notification.timeout;
                }

                const notificationElements = document.getElementsByClassName('notification-container');

                if (notificationElements.length === 0) {
                    return;
                }

                const notificationElement = notificationElements[0];
                notificationElement.classList.add('notification-container-hidden');
                notificationElement.classList.add('notification-container-show');

                const message = document.createElement("span");
                message.innerText = notification.message

                notificationElement.appendChild(message);

                const notificationButtons = document.createElement("div");
                notificationButtons.classList.add("notification-buttons");

                const notificationButton = document.createElement("a");
                notificationButton.classList.add('notification-button');
                const notificationIcon = document.createElement("i");
                notificationIcon.classList.add("bi", "bi-x-circle", "clickable");
                notificationButton.appendChild(notificationIcon);
                notificationButtons.appendChild(notificationButton);

                notificationIcon.onclick = () => {
                    if (notification.onDismissClick) {
                        notification.onDismissClick();
                    }
                    hide();
                }

                notificationElement.appendChild(notificationButtons);

                document.getElementById("header-componnent")!.appendChild(notificationElement);

                setTimeout(hide, timeout);
            });
        }
    });

    const logout = () => {
        window.api.send("logout");
    }

    const login = () => {

    }

    const getProfile = () => {

        if (profile) {
            return <React.Fragment>
                <img className="gravatar" src={profile?.picture} alt="" title={profile?.iss} />
                <i className="fas fa-sign-out-alt text-success icon-lg clickable header-button fa-padding-fix-lg" onClick={logout}></i>
            </React.Fragment>
        }

        return <i className="fas fa-sign-in-alt text-success icon-lg clickable header-button" onClick={login}></i>
    }

    return (<div id="header-componnent">
        <nav className="navbar navbar-expand-lg" >
            <a className="navbar-brand" href="/">
                <img src="static/images/iconfinder_brain-mind-smart-think-intelligence_white.svg" width="40" height="40" className="d-inline-block align-top" alt="" />
                <span>Mindful</span>
            </a>

            <div className="notification-container notification-container-hidden">

            </div>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <a className="nav-item nav-link" href="#/">Home</a>
                <a className="nav-item nav-link" href="#/dashboard">Dashboard</a>
            </div>
            <div className="actions-container">
                <i className="bi bi-arrow-repeat text-success icon-lg clickable sync header-button rotate"></i>
                <i className="bi bi-bell-fill text-success icon-lg clickable header-button"></i>
                {getProfile()}
            </div>
        </nav>
    </div>
    );
}