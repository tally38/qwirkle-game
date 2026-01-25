import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { FormControl, InputLabel, Link, Select, SelectChangeEvent, Slider, Stack } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import { NotificationSound, playNotificationSound, useSettings } from './SettingsContext';

const pages : { [key: string]: string; } = {
  'Play with others': '/',
  'Play against a (bad) AI': '/ai',
  'How to play': '/how-to-play'
};

const soundOptions: { value: NotificationSound; label: string }[] = [
  { value: 'none', label: 'Off' },
  { value: 'chime', label: 'Chime' },
  { value: 'bell', label: 'Bell' },
  { value: 'melody', label: 'Melody' },
  { value: 'fanfare', label: 'Fanfare' },
];

function QwirkleAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElSettings, setAnchorElSettings] = React.useState<null | HTMLElement>(null);
  const { settings, setNotificationSound, setVolume } = useSettings();

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleOpenSettingsMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElSettings(event.currentTarget);
  };

  const handleCloseSettingsMenu = () => {
    setAnchorElSettings(null);
  };

  const handleSoundChange = (event: SelectChangeEvent) => {
    const sound = event.target.value as NotificationSound;
    setNotificationSound(sound);
    playNotificationSound(sound, settings.volume);
  };

  const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
    setVolume(newValue as number);
  };

  const handleVolumeCommit = (_event: React.SyntheticEvent | Event, newValue: number | number[]) => {
    playNotificationSound(settings.notificationSound, newValue as number);
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Qwirkle
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="nav menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {Object.keys(pages).map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu} component={Link} href={pages[page]} >
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Typography
            variant="h5"
            noWrap
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Qwirkle
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {Object.keys(pages).map((page) => (
              <Button
                key={page}
                variant='text'
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
                href={pages[page]}
              >
                {page}
              </Button>
            ))}
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <IconButton
              size="large"
              aria-label="settings"
              aria-controls="settings-menu"
              aria-haspopup="true"
              onClick={handleOpenSettingsMenu}
              color="inherit"
            >
              <SettingsIcon />
            </IconButton>
            <Menu
              id="settings-menu"
              anchorEl={anchorElSettings}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElSettings)}
              onClose={handleCloseSettingsMenu}
            >
              <Box sx={{ px: 2, py: 1, minWidth: 220 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="notification-sound-label">Turn notification</InputLabel>
                  <Select
                    labelId="notification-sound-label"
                    value={settings.notificationSound}
                    label="Turn notification"
                    onChange={handleSoundChange}
                  >
                    {soundOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {settings.notificationSound !== 'none' && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Volume
                    </Typography>
                    <Stack spacing={2} direction="row" alignItems="center">
                      <VolumeDownIcon fontSize="small" color="action" />
                      <Slider
                        size="small"
                        value={settings.volume}
                        min={0}
                        max={1}
                        step={0.1}
                        onChange={handleVolumeChange}
                        onChangeCommitted={handleVolumeCommit}
                      />
                      <VolumeUpIcon fontSize="small" color="action" />
                    </Stack>
                  </Box>
                )}
              </Box>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default QwirkleAppBar;