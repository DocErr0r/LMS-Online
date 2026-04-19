import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Button, Divider } from '@mui/material';

type Props = {
  activeItem: number;
  open: boolean;
  isLogin: boolean;
  setOpen: (open: boolean) => void;
};
const navItems = [
  { href: '/', label: 'Home', id: 0 },
  { href: '/courses', label: 'Courses', id: 1 },
  { href: '/about', label: 'About', id: 2 },
  { href: '/contact-us', label: 'Contact Us', id: 3 },
  { href: '/faq', label: 'FAQ', id: 4 },
];
export const NavItems = ({ open, setOpen, activeItem, isLogin }: Props) => {
  const router = useRouter();

  const handleNavigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  if (typeof window !== 'undefined') {
    addEventListener('resize', () => {
      if (window.screen.width < 800) {
        setOpen(false);
      }
    });
  }

  return (
    <>
      <div className="800:hidden ">
        <button onClick={() => setOpen(!open)} className="flex flex-col justify-center items-center w-10 h-10 sm:space-y-1 space-y-0.5 group">
          {/* Top line */}
          <span
            className={`block h-0.5 sm:w-6 w-4 bg-text transition-all duration-300 ease-in-out
        ${open ? '-rotate-45 translate-y-1 sm:translate-y-1.5' : ''}`}
          ></span>
          <span
            className={`block h-0.5 sm:w-6 w-4 bg-text transition-all duration-300 ease-in-out
        ${open ? 'opacity-0' : ''}`}
          ></span>
          <span
            className={`block h-0.5 sm:w-6 w-4 bg-text transition-all duration-300 ease-in-out
        ${open ? 'rotate-45 -translate-y-1 sm:-translate-y-1.5' : ''}`}
          ></span>
        </button>
      </div>
      <nav className="800:flex hidden justify-center gap-2 1000:gap-5">
        {navItems.map((item) => (
          <Link key={item.id} href={item.href} className={`text-base font-medium transition-colors duration-200 ${activeItem === item.id ? 'text-primary' : 'text-text hover:text-primary-hover'}`}>
            {item.label}
          </Link>
        ))}
      </nav>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          root: {
            style: {
              top: '80px',
            },
          },
        }}
        sx={{
          '& .MuiDrawer-paper': {
            top: '80px',
            width: '100%',
            height: 'auto',
          },
          // Ye line niche wale content ko click karne degi jab menu khula ho
          '& .MuiModal-root': { pointerEvents: 'none', position: 'absolute' },
          '& .MuiBackdrop-root': {
            top: '80px',
          },
        }}
      >
        <Box className="!bg-bg !border-y !border-ring !text-text shadow-xl h-auto max-h-[80vh] p-0 overflow-y-auto">
          {/* <Box sx={{ fontWeight: 700, fontSize: 18, mb: 1 }}>Menu</Box> */}
          <List>
            {navItems.map((item) => (
              <ListItemButton key={item.id} onClick={() => handleNavigate(item.href)} className={`text-base font-medium transition-colors duration-200 ${activeItem === item.id ? '!bg-primary' : 'text-text hover:!bg-primary-hover'}`}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
            {/* <Divider className='!bg-ring'/> */}
            {false && (
              <div className="flex max-800:flex-col gap-2 py-4 px-2">
                <Button variant="outlined" className="hover:!bg-primary-hover !border-ring !text-text">
                  {/* <Link href="/auth"> */}
                  Sign In
                  {/* </Link> */}
                </Button>
                <Button variant="contained" className="!bg-primary !text-gray-100 hover:!bg-primary-hover">
                  {/* <Link href="/auth?mode=register"> */}
                  Get Started
                  {/* </Link> */}
                </Button>
              </div>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};
