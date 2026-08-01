import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Stack,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  useMediaQuery,
  Divider,
  Tooltip,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import HeightIcon from "@mui/icons-material/Height";
import ScaleIcon from "@mui/icons-material/MonitorWeight";
import CakeIcon from "@mui/icons-material/Cake";
import ProfileEdit from "./ProfileEdit";
import { FaVenus, FaMars, FaGenderless } from "react-icons/fa";

const ProfileInfoSection = ({ user, onProfileUpdate }) => {
  const [openEdit, setOpenEdit] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");

  const avatarUrl = useMemo(() => {
    if (!user) return "";
    switch (user.gender) {
      case 0:
        return "https://xsgames.co/randomusers/assets/avatars/male/15.jpg";
      case 1:
        return "https://xsgames.co/randomusers/assets/avatars/female/15.jpg";
      case 2:
        return "https://xsgames.co/randomusers/assets/avatars/male/77.jpg";
      default:
        return "https://xsgames.co/randomusers/assets/avatars/male/77.jpg";
    }
  }, [user]);

  if (!user) return null;

  const { name, age, height, weight, gender } = user;
  const heightInMeters = height / 100;
  const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

  const getBmiCategory = () => {
    if (bmi < 18.5) return "Zayıf";
    if (bmi < 24.9) return "Normal";
    if (bmi < 29.9) return "Fazla kilolu";
    return "Obez";
  };

  const getBmiColor = () => {
    if (bmi < 18.5) return "#42a5f5";
    if (bmi < 24.9) return "#66bb6a";
    if (bmi < 29.9) return "#ffa726";
    return "#ef5350";
  };

  const getGender = () => {
    switch (gender) {
      case 0:
        return { label: "Erkek", icon: <FaMars color="#2196f3" /> };
      case 1:
        return { label: "Kadın", icon: <FaVenus color="#e91e63" /> };
      case 2:
        return { label: "Diğer", icon: <FaGenderless color="#9c27b0" /> };
      default:
        return { label: "Bilinmiyor", icon: <FaGenderless /> };
    }
  };

  const genderInfo = getGender();

  return (
    <>
      <Card
        sx={{
          width: "100%",
          mx: "auto",
          p: { xs: 2, md: 4 },
          boxShadow: 10,
          position: "relative",
          background: "linear-gradient(135deg,rgb(0, 0, 0),rgb(114, 114, 114))",
          color: "#fff",
          borderRadius: "0 !important",
        }}
      >
        <IconButton
          sx={{ position: "absolute", top: 12, right: 12, color: "#fff" }}
          aria-label="edit"
          onClick={() => setOpenEdit(true)}
        >
          <EditIcon />
        </IconButton>

        <CardContent>
          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={3}
            alignItems="center"
            justifyContent="left"
          >
            <Avatar
              src={avatarUrl}
              alt="Profil"
              sx={{
                width: isMobile ? 90 : 120,
                height: isMobile ? 90 : 120,
                border: "3px solid white",
                boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
              }}
            />
            <Box textAlign={isMobile ? "center" : "left"}>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                fontWeight="bold"
                sx={{ color: "#fff" }}
              >
                {name}
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                mt={1}
                justifyContent={isMobile ? "center" : "flex-start"}
              >
                {genderInfo.icon}
                <Typography variant="body2" fontWeight="medium" sx={{ color: "#fff" }}>
                  {genderInfo.label}
                </Typography>
              </Stack>
              <Divider sx={{ my: 2, borderColor: "#fff" }} />
              <Grid container spacing={3} mt={1} justifyContent="center">
                <Grid size={{ xs:6 ,sm:3}} display="flex" justifyContent="center">
                  <StatCard
                    icon={<HeightIcon color="primary" />}
                    label="Boy"
                    value={`${height} cm`}
                  />
                </Grid>
                <Grid  size={{ xs:6 ,sm:3}} display="flex" justifyContent="center">
                  <StatCard
                    icon={<ScaleIcon color="success" />}
                    label="Kilo"
                    value={`${weight} kg`}
                  />
                </Grid>
                <Grid  size={{ xs:6 ,sm:3}} display="flex" justifyContent="center">
                  <StatCard icon={<CakeIcon color="secondary" />} label="Yaş" value={age} />
                </Grid>
                <Grid  size={{ xs:6 ,sm:3}} display="flex" justifyContent="center">
                <StatCard
                  icon={<FitnessCenterIcon sx={{ color: getBmiColor() }} />}
                  label="BMI"
                  value={
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ color: getBmiColor() }}
                      component="span"  // Change this to span to prevent nested <p> tags
                    >
                      {`${bmi} (${getBmiCategory()})`}
                    </Typography>
                  }
                />
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullScreen={isMobile}>
        <DialogTitle>Profili Düzenle</DialogTitle>
        <ProfileEdit
          initialData={user}
          onClose={() => setOpenEdit(false)}
          onSave={onProfileUpdate}
        />
      </Dialog>
    </>
  );
};

const StatCard = ({ icon, label, value }) => {
  return (
    <Paper
      elevation={4}
      sx={{
        width: 120,
        height: 100,
        p: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to top left, #e0f2f1, #b2dfdb)",
        color: "#004d40",
        mx: "auto",
        textAlign: "center",
      }}
    >
      <Tooltip title={label}>
        <Box sx={{ fontSize: 28, mb: 1 }}>{icon}</Box>
      </Tooltip>
      <Typography variant="body2" fontWeight="medium">
        {value}
      </Typography>
    </Paper>
  );
};

export default ProfileInfoSection;
