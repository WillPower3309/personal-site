import * as React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const activeClassName = 'nav-item-active'

const Container = styled.div`
    padding: 1% 5%;
    display: flex;
    justify-content: space-between;
`;

const List = styled.ul`
    list-style-type: none;
    overflow: hidden;

    li {
        float:left;
    }
`;

const NavItem = styled(NavLink).attrs({ activeClassName })`
    display: block;
    color: white;
    text-align: center;
    padding: 14px 16px;
    text-decoration: none;
    outline: 0;

    &.${activeClassName} {
        text-decoration: underline;
    }

    &:hover {
        background-color: #111;
    }
`;

function Navbar() {
    return(
        <Container>
            <h1>WillMcKinnon</h1>
            <List>
                <li>
                    <NavItem exact to="/">Home</NavItem>
                </li>
                <li>
                    <NavItem to="/blog">Blog</NavItem>
                </li>
                <li>
                    <NavItem to="/books">Books</NavItem>
                </li>
                <li>
                    <NavItem to="/contact">Contact</NavItem>
                </li>
                <li>
                    <NavItem to="/about">About</NavItem>
                </li>
            </List>
        </Container>
    );
}

export default Navbar;
