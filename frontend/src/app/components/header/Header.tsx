'use client';

import React, { FC, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { ThemeToggle } from './ThemaButton';
import { MdOutlineNotifications } from 'react-icons/md';
import { FaRegUser } from 'react-icons/fa';
import { NavItems } from './NavItems';
import Badge from '@mui/material/Badge';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { IoMdLogOut, IoMdLogIn } from 'react-icons/io';
import { FiSettings } from 'react-icons/fi';
import { Button } from '@mui/material';
import { LuGraduationCap } from 'react-icons/lu';

interface HeaderProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeItem: number;
}

const Header: FC<HeaderProps> = ({ open, setOpen, activeItem }) => {
  const { theme, setTheme } = useTheme();
  const [active, setActive] = useState(false);
  // const [opensidebar, setOpensidebar] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const userMenuOpen = Boolean(userMenuAnchor);

  const notificationCount = useMemo(() => 1, []);

  if (typeof window !== 'undefined') {
    addEventListener('scroll', () => {
      if (window.scrollY > 85) {
        setActive(true);
      } else {
        setActive(false);
      }
    });
  }
  const isLogin = false;

  return (
    <header className="w-full relative">
      <div className={`${active ? 'backdrop-blur-lg bg-gradient-to-b from-[#d4d3d5]/60 via-[#e2dff2]/60 to-[#e6cdf7]/60 dark:bg-gradient-to-b dark:from-[#0b0615]/60 dark:via-[#120a23]/60 dark:to-[#1b1233]/60 fixed top-0 left-0 w-full h-[80px] z-[80] border-b dark:border-gray-500 shadow-xl duration-300' : 'w-full border-b h-[80px] z-[80] dark:border-gray-500 dark:shadow '}`}>
        <div className="w-[95%] h-full py-2 m-auto 880px:w-[92%]">
          <div className="w-full h-full flex items-center justify-between">
            {/* Logo */}
            <div className="flex flex-1 items-center gap-2">
              <LuGraduationCap className="bg-primary text-gray-100 rounded-lg p-1 h-8 w-8 sm:w-10 sm:h-10" />
              <Link href="/">
                <span className="md:text-3xl sm:text-2xl text-xl font-bold text-primary">LearnMax</span>
              </Link>
            </div>
            {/* Navigation Links */}
            <div className="flex max-800:order-2">
              <NavItems activeItem={activeItem} open={open} isLogin={isLogin} setOpen={setOpen} />
            </div>
            {/* Right Side Icons */}
            <div className="flex flex-1 justify-end text-text items-center gap-0.5 md:gap-1">
              <ThemeToggle />
              <IconButton
                onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                // sx={{
                //   color: 'inherit',
                //   '&:hover': { backgroundColor: 'rgba(0,233,0,0.06)' },
                // }}
                aria-controls={userMenuOpen ? 'user-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={userMenuOpen ? 'true' : undefined}
                className="relative sm:p-2 p-1 !text-inherit  hover:!bg-primary transition"
              >
                <Badge variant="dot" color="error" invisible={notificationCount === 0 || !isLogin}>
                  <FaRegUser className="sm:w-6 sm:h-6 h-4 w-4" />
                </Badge>
              </IconButton>

              <Menu
                id="user-menu"
                anchorEl={userMenuAnchor}
                open={userMenuOpen}
                onClose={() => setUserMenuAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                  paper: {
                    className: '!bg-bg border border-ring !text-text shadow-xl',
                  },
                }}
              >
                {isLogin ? (
                  <>
                    {/* <MenuItem
                  onClick={() => {
                    setUserMenuAnchor(null);
                    // toggleTheme(); 
                    }}
                    >
                  <ListItemIcon>{theme === 'light' ? '🌙' : '☀️'}</ListItemIcon>
                  Theme
                </MenuItem> */}
                    <MenuItem
                      onClick={() => {
                        setUserMenuAnchor(null);
                      }}
                      className="hover:!bg-primary-hover"
                    >
                      <ListItemIcon>
                        <Badge color="error" badgeContent={notificationCount} invisible={notificationCount === 0} max={9}>
                          <MdOutlineNotifications className="w-5 h-5 text-text" />
                        </Badge>
                      </ListItemIcon>
                      Notifications
                    </MenuItem>

                    {/* <Divider className="!bg-ring" /> */}

                    <MenuItem
                      className="hover:!bg-primary-hover !border-y !border-ring"
                      onClick={() => {
                        setUserMenuAnchor(null);
                      }}
                    >
                      <ListItemIcon>
                        <FaRegUser className="w-4 h-4 text-text" />
                      </ListItemIcon>
                      Profile
                    </MenuItem>

                    <MenuItem
                      className="hover:!bg-primary-hover !border-y !border-ring"
                      onClick={() => {
                        setUserMenuAnchor(null);
                      }}
                    >
                      <ListItemIcon>
                        <FiSettings className="w-4 h-4 text-text" />
                      </ListItemIcon>
                      Setting
                    </MenuItem>

                    <MenuItem
                      className="hover:!bg-primary-hover "
                      onClick={() => {
                        setUserMenuAnchor(null);
                      }}
                    >
                      <ListItemIcon>
                        <IoMdLogOut className="w-4 h-4 text-text" />
                      </ListItemIcon>
                      Log Out
                    </MenuItem>
                  </>
                ) : (
                  // <div className="flex gap-1 !px-1">
                  //   <Button variant="outlined" className="hover:!bg-primary-hover !border-ring !text-text">
                  //     {/* <Link href="/auth"> */}
                  //     Sign In
                  //     {/* </Link> */}
                  //   </Button>
                  //   <Button variant="contained" className="!bg-primary !text-gray-100 hover:!bg-primary-hover !px-2">
                  //     {/* <Link href="/auth?mode=register"> */}
                  //     Get Started
                  //     {/* </Link> */}
                  //   </Button>
                  // </div>

                  <>
                    <MenuItem
                      className="hover:!bg-primary-hover !border-b !border-ring "
                      onClick={() => {
                        setUserMenuAnchor(null);
                      }}
                    >
                      <ListItemIcon>
                        <IoMdLogIn className="w-4 h-4 text-text" />
                      </ListItemIcon>
                      Sign In
                    </MenuItem>
                    <MenuItem
                      className="bg-primary hover:!bg-primary-hover "
                      onClick={() => {
                        setUserMenuAnchor(null);
                      }}
                    >
                      <ListItemIcon>
                        <IoMdLogIn className="w-4 h-4 text-text" />
                      </ListItemIcon>
                      Sign Up
                    </MenuItem>
                  </>
                )}
              </Menu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
