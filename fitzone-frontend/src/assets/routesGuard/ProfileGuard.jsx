import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { userApi } from "../../api/axios"; // userApi'yi axios'dan alıyoruz

export default function ProfileGuard({ children }) {
  const [checking, setChecking] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false); // Profilin tamamlanıp tamamlanmadığını kontrol edeceğiz

  useEffect(() => {
    const checkProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setChecking(false);
        return;
      }
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await userApi.get("/api/users/me", config);
        
        // Profil mevcutsa ve tamamlanmışsa
        if (response.data.name && response.data.age && response.data.height && response.data.weight) {
          setIsProfileComplete(true); // Profil tam olarak tamamlanmış
          setHasProfile(true); // Profil mevcut
        } else {
          setIsProfileComplete(false); // Profil tamamlanmamış
          setHasProfile(true); // Profil mevcut ama tamamlanmamış
        }
      } catch (error) {
        console.error("Profil kontrolü hatası:", error);
        setHasProfile(false); // Profil yok
      } finally {
        setChecking(false);
      }
    };

    checkProfile();
  }, []);

  if (checking) {
    return null; // Burada yükleniyor göstergesi ekleyebilirsin
  }

  // Eğer profil yoksa ve /profile-create sayfasına gitmeye çalışıyorsa
  const currentPath = window.location.pathname;

  if (currentPath === "/profile-create" && hasProfile) {
    return <Navigate to="/profile" replace />; // Profil varsa, profile sayfasına yönlendir
  }

  // Eğer profil yoksa ya da tamamlanmamışsa, her iki durumda da /profile-create sayfasına yönlendiriyoruz
  if (!hasProfile || !isProfileComplete) {
    return <Navigate to="/profile-create" replace />;
  }

  // Eğer profil mevcut ve tamamlanmışsa, children'ı render et
  return children;
}
