import React from "react";
import './Nav.scss'
import { NavLink } from "react-router-dom";
import { GrDashboard } from "react-icons/gr";
import { MdDashboard } from "react-icons/md";
import { DatasetController } from "chart.js";
import { FaHistory, FaTable } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";

class Nav extends React.Component {
    render() {
        return (
            <div className="topnav">
                <NavLink to="/" activeClassName="active" exact={true}>
                    Dashboard<> </>
                    <MdDashboard/>
                </NavLink>
                <NavLink to="/tablecomponent" activeClassName="active">
                    Datasensor<> </>
                    <FaTable/>
                </NavLink>
                <NavLink to="/action" activeClassName="active">
                    Action History<> </>
                    <FaHistory/>
                </NavLink>
                <NavLink to="/profile" activeClassName="active">
                    Profile<> </>
                    <CgProfile/>
                </NavLink>
                <NavLink to ="/bai5" activeClassName="active">
                    Bài 5
                </NavLink>
            </div>
        );
    }
}

export default Nav;
