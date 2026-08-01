import React from 'react';
import { Paper, Box, Typography, Button, Container, Grid, Card, CardMedia, CardContent, Avatar, Stack } from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { Link, useNavigate, Navigate } from 'react-router-dom'; // Assuming react-router-dom v6+ for useNavigate

import heroimg from '../assets/images/hero.jpg'; // Hero image path
import main_beslenme from '../assets/images/main_beslenme.jpg'; // Nutrition image path
import workoutBg from '../assets/images/bg.png'; // Workout background image path

import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';


import { motion } from 'framer-motion';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2', // Mavi
            light: '#42a5f5',
            dark: '#1565c0',
        },
        secondary: {
            main: '#ff9800', // Turuncu
            light: '#ffc947',
            dark: '#f57c00',
        },
        background: {
            default: '#fff',
            paper: '#f5f5f5',
        },
        text: {
            primary: '#212121',
            secondary: '#757575',
        },
    },
    typography: {
        fontFamily: "'Roboto', sans-serif",
        h2: { fontWeight: 700 },
        h4: { fontWeight: 700 },
        h5: { fontWeight: 700 },
        button: { fontWeight: 600, borderRadius: '50px' },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    padding: '12px 24px',
                    fontSize: '1rem',
                    textTransform: 'none', 
                },
                sizeLarge: {
                    padding: '16px 32px',
                    fontSize: '1.1rem',
                },
                containedPrimary: {
                    '&:hover': {
                        backgroundColor: '#1565c0',
                    },
                },
                containedSecondary: {
                    '&:hover': {
                        backgroundColor: '#f57c00',
                    },
                },
                outlinedPrimary: {
                    border: '2px solid #1976d2',
                    '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)', 
                    },
                },
               
                outlinedInherit: {
                    borderColor: 'rgba(255, 255, 255, 0.7)', 
                    color: 'white',
                    '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                }
            },
        },
        MuiCard: { 
                root: {
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': {
                        boxShadow: '0px 6px 12px rgba(0,0,0,0.15)', // Enhanced hover shadow
                    },
                },
            },
        },
        MuiPaper: { 
            styleOverrides: {
                root: {
                    transition: 'box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out',
                    '&:hover': {
                        // boxShadow: '0px 6px 12px rgba(0,0,0,0.15)',
                        // transform: 'translateY(-4px)'
                    }
                }
            }
        }
    },
);

// Özel Hero Butonu Stili
const HeroButton = styled(Button)(({ theme }) => ({
    padding: theme.spacing(1.5, 3), 
    fontSize: '1rem', 
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(2, 4),
        fontSize: '1.1rem',
    },
    fontWeight: theme.typography.button.fontWeight,
    borderRadius: theme.typography.button.borderRadius,
}));

// Kahraman Bölgesi
function HeroSection() {
    const navigate = useNavigate();
    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            sx={{
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed', 
                backgroundPosition: 'center',
                minHeight: 'calc(100vh - 64px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: 'white',
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${heroimg})`,
                padding: { xs: theme.spacing(3, 2), md: theme.spacing(4, 3) },
            }}
        >
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                <Typography variant="h2" component="h1" color="secondary" mb={2} sx={{
        fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.5rem' },
        background: `linear-gradient(to top, ${theme.palette.secondary.main}, #c0c0c0)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 'bold'
      }}> {/* Semantic h1 for main heading */}
                    Fitzone
                </Typography>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
    <Typography
      variant="h2"
      component="h1"
      mb={2}
      sx={{
        fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.5rem' },
        background: `linear-gradient(to bottom, ${theme.palette.secondary.main}, #c0c0c0)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 'bold'
      }}
    >
      Enerjin Senin, Sonuçlar Senin, Topluluk Senin!
    </Typography>


            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
                <Typography
                    variant="subtitle1"
                    mb={4}
                    sx={{ fontSize: { xs: '1rem', md: '1.2rem' }, maxWidth: { xs: '90%', md: '80%' }, mx: 'auto' }}
                >
                    Sana özel antrenman programları, motive edici içerikler ve her adımda yanında olan bir topluluk ile daha sağlıklı ve dengeli bir yaşama adım at.
                </Typography>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 3 }} justifyContent="center">
                    <HeroButton variant="contained" color="secondary" size="large" startIcon={<FitnessCenterIcon />} onClick={() => navigate('/register')}>
                        Hemen Fitzone Ailesine Katıl
                    </HeroButton>
                    <HeroButton variant="outlined" color="inherit" size="large" startIcon={<PeopleIcon />} onClick={() => navigate('/workout')}>
                        Programlarımıza Göz Atın
                    </HeroButton>
                </Stack>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.9 }}>
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon sx={{ fontSize: { xs: 28, md: 30 } }} />
                    <Typography variant="body2" color="inherit">
                        Kanıtlanmış Sonuçlar
                    </Typography>
                </Box>
            </motion.div>
        </Box>
    );
}

const ProgramsSection = () => {
    const advantages = [
        {
            title: 'Kişiye Özel Beslenme Programları',
            description: 'Lisanslı diyetisyenlerimiz tarafından hedeflerinize ve yaşam tarzınıza uygun, bilimsel temelli beslenme planları.',
            icon: <RestaurantIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
        },
        {
            title: 'Kişiye Özel Spor Programları',
            description: 'Deneyimli eğitmenlerimiz tarafından fitness seviyenize ve hedeflerinize özel olarak hazırlanan etkili antrenman planları.',
            icon: <FitnessCenterIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
        },
        {
            title: 'Uzman Diyetisyen Desteği',
            description: 'Sağlıklı beslenme alışkanlıkları kazanmanız ve beslenme ile ilgili tüm sorularınız için profesyonel rehberlik.',
            icon: <PersonIcon sx={{ fontSize: 40, color: 'secondary.dark' }} />,
        },
        {
            title: 'Uzman Eğitmen Desteği',
            description: 'Doğru egzersiz tekniklerini öğrenmeniz, motivasyonunuzu artırmanız ve güvenli bir şekilde ilerlemeniz için uzman rehberlik.',
            icon: <PersonIcon sx={{ fontSize: 40, color: 'primary.dark' }} />,
        },
    ];

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.2 }} // Adjusted amount for earlier trigger
            sx={{ py: { xs: 6, md: 8 }, bgcolor: 'background.paper' }}
        >
            <Container maxWidth="md" sx={{ textAlign: 'center', mb: 5 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }}>
                    <Typography variant="h4" component="h2" fontWeight="bold" color="primary" mb={2} sx={{ fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' } }}>
                        Neden Fitzone? Çünkü Sağlığınız Bize Özel!
                    </Typography>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} viewport={{ once: true }}>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: { xs: '95%', sm: '85%' }, mx: 'auto' }}>
                        Hedeflerinize ulaşmanız için size sadece ekipman sunmuyoruz. Uzman kadromuzla kişiye özel çözümler üretiyoruz:
                    </Typography>
                </motion.div>
            </Container>
            <Container maxWidth="lg">
                {/* Grid container with responsive spacing */}
                <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center">
                    {advantages.map((advantage, index) => (
                        <Grid
                            component={motion.div}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }} // Adjusted delay for smoother stagger
                            viewport={{ once: true, amount: 0.3 }}
                            size={{ xs: 12, sm: 6, md: 3 }} // Responsive sizing
                            key={index}
                        >
                            <Paper sx={{ p: { xs: 2, md: 3 }, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <Box>
                                    <Avatar sx={{ mx: 'auto', mb: 2, width: 56, height: 56, bgcolor: 'transparent' }}>
                                        {advantage.icon}
                                    </Avatar>
                                    <Typography variant="h6" component="h3" fontWeight="bold" mb={1} sx={{ fontSize: { xs: '1.1rem', md: '1.2rem' } }}>
                                        {advantage.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {advantage.description}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

// Beslenme Bölümü
function NutritionSection() {
    const navigate = useNavigate();
    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.2 }}
            sx={{
                minHeight: '80vh',
                py: { xs: 6, md: 8 },
               
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url(${main_beslenme})`, // Slightly darker overlay
                backgroundAttachment: 'fixed', 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Container
                maxWidth="md"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    viewport={{ once: true }}
                    sx={{
                        bgcolor: 'rgba(0, 0, 0, 0.5)', 
                        p: { xs: 3, sm: 4, md: 5 }, 
                        borderRadius: theme.shape.borderRadius * 2, 
                        backdropFilter: "blur(8px)", 
                        WebkitBackdropFilter: "blur(8px)",
                        textAlign: 'center',
                        maxWidth: '700px', 
                        width: '90%' 
                    }}
                >
                    <Typography variant="h4" component="h2" mb={2} sx={{ fontSize: { xs: '1.8rem', sm: '2rem', md: '2.2rem' } }}>
                        Beslenmeni Güce Dönüştür
                    </Typography>
                    <Typography variant="body1" mb={3} sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                        Performansının arkasındaki itici gücü keşfet.
                        Sana özel planlarla enerjini dengele, hedeflerine daha hızlı ulaş.
                    </Typography>
                    <Button variant="contained" color="secondary" size="large" onClick={() => navigate('/nutrition')} sx={{ fontWeight: 'bold', px: { xs: 4, md: 5 }, py: { xs: 1.5, md: 1.5 } }}>
                        Planını Hemen Oluştur
                    </Button>
                </motion.div>
            </Container>
        </Box>
    );
}


const AiSection = () => {
    const features = [
        {
            title: 'Akıllı Beslenme Önerileri',
            description: 'Günlük hedefleriniz, öğün geçmişiniz ve diyet tercihlerinize göre otomatik olarak kişiselleştirilmiş yemek önerileri.',
            icon: <RestaurantIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
        },
        {
            title: 'Kişisel Antrenman Optimizasyonu',
            description: 'Egzersiz geçmişinize, ilerleme durumunuza ve hedeflerinize göre adapte olan antrenman programları.',
            icon: <FitnessCenterIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
        },
        {
            title: 'İlerlemeni Takip Et',
            description: 'BMI, kalori dengesi, makro takibi gibi metriklerle ilerlemenizi grafiklerle analiz eden yapay zeka destekli sistem.',
            icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'green' }} />, // Using a direct color for success
        },
        {
            title: 'Kendi Asistanınla Konuş',
            description: 'Spor ve beslenme hakkında sorularınızı yanıtlayan, hedeflerinize göre öneriler sunan akıllı sohbet asistanı.',
            icon: <SmartToyIcon sx={{ fontSize: 40, color: 'primary.dark' }} />,
        },
    ];

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.2 }}
            sx={{ py: { xs: 6, md: 8 }, bgcolor: 'background.default' }}
        >
            <Container maxWidth="md" sx={{ textAlign: 'center', mb: 5 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }}>
                    <Typography variant="h4" component="h2" fontWeight="bold" color="primary" mb={2} sx={{ fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' } }}>
                        Yapay Zeka ile Daha Akıllı, Daha Etkili!
                    </Typography>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} viewport={{ once: true }}>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: { xs: '95%', sm: '85%' }, mx: 'auto' }}>
                        Fitzone'da yapay zeka destekli sistemlerle sadece verileri takip etmiyoruz; sana özel planlar ve rehberlik sunuyoruz:
                    </Typography>
                </motion.div>
            </Container>
            <Container maxWidth="lg">
                {/* Grid container with responsive spacing */}
                <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center">
                    {features.map((feature, index) => (
                        <Grid
                            component={motion.div}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                            viewport={{ once: true, amount: 0.3 }}
                            size={{ xs: 12, sm: 6, md: 3 }} // Responsive sizing
                            key={index}
                        >
                            <Paper sx={{ p: { xs: 2, md: 3 }, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <Box>
                                    <Avatar sx={{ mx: 'auto', mb: 2, width: 56, height: 56, bgcolor: 'transparent' }}>
                                        {feature.icon}
                                    </Avatar>
                                    <Typography variant="h6" component="h3" fontWeight="bold" mb={1} sx={{ fontSize: { xs: '1.1rem', md: '1.2rem' } }}>
                                        {feature.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {feature.description}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

// Kişisel Antrenman Planı 
function PersonalPlanCTA() {
    const navigate = useNavigate();
    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, amount: 0.3 }}t
            sx={{
               
                backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url(${workoutBg})`, // Darker overlay
                backgroundAttachment: 'fixed', 
                backgroundSize: 'cover',
                minHeight: '80vh', 
                backgroundPosition: 'center',
                py: { xs: 6, md: 10 },
                color: 'white',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                    sx={{
                        bgcolor: 'rgba(0, 0, 0, 0.5)', 
                        p: { xs: 3, sm: 4, md: 5 },
                        borderRadius: theme.shape.borderRadius * 2,
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        textAlign: 'center',
                        maxWidth: '700px',
                        width: '90%'
                    }}
                >
                    <Typography
                        variant="h4" component="h2"
                        mb={2}
                        sx={{ fontWeight: 'bold', fontSize: { xs: '1.8rem', sm: '2rem', md: '2.5rem' } }}
                    >
                        Hayalini Kurduğun Vücut Bir Tık Uzağında
                    </Typography>
                    <Typography variant="body1" mb={4} sx={{ maxWidth: { xs: '95%', md: '90%' }, mx: 'auto', fontSize: { xs: '0.9rem', md: '1rem' } }}>
                        Kişisel hedeflerine özel egzersiz planlarıyla en iyi versiyonuna ulaş. Her seviyeye uygun antrenman içerikleriyle başarı kaçınılmaz!
                    </Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        sx={{ fontWeight: 'bold', px: { xs: 4, md: 5 }, py: { xs: 1.5, md: 1.5 } }}
                        onClick={() => navigate('/add-workout')}
                    >
                        Kendi Planını Oluştur
                    </Button>
                </motion.div>
            </Container>
        </Box>
    );
}


// Ana Sayfa 
function HomePage() {
    return (
        <ThemeProvider theme={theme}>
        
            <Box sx={{ overflowX: 'hidden' }}> 
                <HeroSection/>
                <ProgramsSection />
                <NutritionSection />
                <AiSection />
                <PersonalPlanCTA />
            </Box>
        </ThemeProvider>
    );
}

export default HomePage;