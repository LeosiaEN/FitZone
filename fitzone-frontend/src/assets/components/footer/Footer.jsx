import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import { Facebook, Instagram, Twitter, YouTube } from '@mui/icons-material';

const Footer = () => {
 return (
  <Box
   component="footer"
   sx={{
    backgroundColor: '#111',
    color: '#fff',
    py: 6,
    mt: 'auto',
   }}
  >
   <Container maxWidth="lg">
    {/* Use Grid container for layout and define spacing */}
    <Grid container spacing={4} justifyContent="space-between">
     {/* Brand / Logo */}
     {/* Removed 'item' prop, moved breakpoint props to 'grid' prop */}
     <Grid grid={{ xs: 12, sm: 6, md: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
       FitZone
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
       Sağlıklı yaşam için dijital antrenörün.
      </Typography>
     </Grid>

     {/* Menü */}
     {/* Removed 'item' prop, moved breakpoint props to 'grid' prop */}
     <Grid grid={{ xs: 6, sm: 3, md: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
       Sayfalar
      </Typography>
      {/* Using <a> tags for external/router links */}
      <Link href="/" underline="hover" color="inherit" display="block">Anasayfa</Link>
      <Link href="/profile" underline="hover" color="inherit" display="block">Profil</Link>
      <Link href="/add-workout" underline="hover" color="inherit" display="block">Program Oluştur</Link>
     </Grid>

     {/* Bilgi */}
     {/* Removed 'item' prop, moved breakpoint props to 'grid' prop */}
     <Grid grid={{ xs: 6, sm: 3, md: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
       Bilgi
      </Typography>
      {/* Using <a> tags for external/router links */}
      <Link href="/about" underline="hover" color="inherit" display="block">Hakkımızda</Link>
      <Link href="/contact" underline="hover" color="inherit" display="block">İletişim</Link>
      <Link href="/privacy" underline="hover" color="inherit" display="block">Gizlilik</Link>
     </Grid>

     {/* Sosyal Medya */}
     {/* Removed 'item' prop, moved breakpoint props to 'grid' prop */}
     <Grid grid={{ xs: 12, sm: 12, md: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
       Bizi Takip Et
      </Typography>
      <Box>
       <IconButton color="inherit" href="https://facebook.com" target="_blank">
        <Facebook />
       </IconButton>
       <IconButton color="inherit" href="https://instagram.com" target="_blank">
        <Instagram />
       </IconButton>
       <IconButton color="inherit" href="https://twitter.com" target="_blank">
        <Twitter />
       </IconButton>
       <IconButton color="inherit" href="https://youtube.com" target="_blank">
        <YouTube />
       </IconButton>
      </Box>
     </Grid>
    </Grid>

    {/* Alt Bilgi */}
    <Box mt={4} textAlign="center">
     <Typography variant="body2" color="gray">
      © {new Date().getFullYear()} FitZone. Tüm hakları saklıdır.
     </Typography>
    </Box>
   </Container>
  </Box>
 );
};

export default Footer;