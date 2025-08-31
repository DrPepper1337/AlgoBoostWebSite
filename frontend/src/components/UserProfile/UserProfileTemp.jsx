// import './UserProfile.css'
import '../MemberHub/MemberHub.css';
import DropDownProfile from '../DropDownProfile/DropDownProfile';
import { useRef, useState} from 'react';
import { FaUser, FaChevronRight } from 'react-icons/fa';
import {Link } from 'react-router-dom';
import axios from 'axios';
import { useEffect} from 'react';


export default function UserProfile() {

    const menuRef = useRef(null);
    const [open, setOpen] = useState(false);

    const [user, setUser] = useState(null);


    return (
        <div className="user-wrapper">
       
        <h2>Coming Soon!</h2>
        </div>
    );
}