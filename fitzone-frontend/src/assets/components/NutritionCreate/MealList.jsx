import React, { useState } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    IconButton,
    Modal,
    Divider,
    Button,
    List,
    ListItem,
    ListItemText,
    // Grid, // Mevcut yapı için Grid'e gerek yok, Box yeterli
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CloseIcon from "@mui/icons-material/Close";
// Renk importlarını silebiliriz, tema renklerini kullanalım
// import { grey, green, red, blueGrey } from "@mui/material/colors";
// nutritionApi importı zaten var

const MealList = ({ meals, onDelete }) => {
    const [openModal, setOpenModal] = useState(false);
    // Modal için seçilen planın tüm verisini saklayalım
    const [selectedGroupForModal, setSelectedGroupForModal] = useState(null);

    // Ana listede göstermek için plan adına ve tarihe göre grupla
    // Her grubun ilk öğün girdisinin ID'sini saklayalım (silmek için kullanılabilir)
    const groupedPlansForList = meals.reduce((acc, meal) => {
        // planName boşsa 'Belirtilmemiş Plan' gibi bir şey kullanalım
        const planName = meal.planName && meal.planName.trim() !== '' ? meal.planName : 'Belirtilmemiş Plan';
        const dateKey = new Date(meal.date).toLocaleDateString();
        const key = `${planName}-${dateKey}`; // Grup anahtarı: PlanAdı-Tarih

        if (!acc[key]) {
            acc[key] = {
                key: key, // Grubun benzersiz anahtarı
                planName: planName,
                date: meal.date,
                meals: [], // Bu grup altındaki tüm öğün girdileri
                firstMealId: meal.id, // Grubun bir temsilcisi olarak ilk öğün ID'si
            };
        }
        acc[key].meals.push(meal);
        return acc;
    }, {});

    // Modal için seçilen grubun öğünlerini türlerine göre grupla
    const groupedMealsForModal = (groupedItem) => {
         if (!groupedItem || !groupedItem.meals) return {};

        return groupedItem.meals.reduce((acc, meal) => {
            if (!acc[meal.mealType]) {
                acc[meal.mealType] = [];
            }
            acc[meal.mealType].push(meal);
            return acc;
        }, {});
    };


    // Ana listedeki bir plana tıklanınca modalı aç
    const handleOpenModal = (groupedItem) => {
        setSelectedGroupForModal(groupedItem);
        setOpenModal(true);
    };

    // Modalı kapat
    const handleCloseModal = () => {
        setSelectedGroupForModal(null);
        setOpenModal(false);
    };

    // Öğün girdisini silme işlemi (parent'ın onDelete callback'ini kullanır)
    const handleDeleteMealEntry = (mealId) => {
         if (onDelete) {
             onDelete(mealId);
         }
         // Modalı güncellemek için: Eğer silinen öğün modalda gösteriliyorsa,
         // meal listesi güncellendikten sonra modal otomatik güncellenir veya
         // modalı kapatıp tekrar açabiliriz. Şimdilik listenin güncellenmesi yeterli.
         // Eğer modal açıkken silinirse ve o öğün modalın parçasıysa, parent'ın
         // meals state'i değiştiğinde burası da re-render olur ve doğru görünür.
    };


    return (
        <>
            {/* Ana Liste Bölümü */}
            <Box sx={{ mt: 4 }}> {/* Üstten boşluk ekle */}
                <Typography
                    variant="h6" // Başlık boyutu h6 yapıldı
                    gutterBottom
                    fontWeight={600} // Daha az kalın
                    sx={{ mb: 2 }} // Alt boşluk
                >
                    Beslenme Planlarım
                </Typography>
                <Divider sx={{ mb: 3 }} /> {/* Altına ayırıcı */}

                {/* Öğün Planlarını Listele */}
                 {Object.values(groupedPlansForList).length === 0 ? (
                     <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                         Henüz kayıtlı bir öğün planı yok.
                     </Typography>
                 ) : (
                     Object.values(groupedPlansForList).map((groupedItem) => (
                         <Box
                             key={groupedItem.key} // Grup anahtarını kullan
                             sx={{
                                 display: "flex",
                                 alignItems: "center",
                                 justifyContent: "space-between", // Butonları sağa hizala
                                 p: 2, // İç padding
                                 mb: 2, // Alt boşluk
                                 border: "1px solid", // Kenarlık eklendi
                                 borderColor: "divider", // Tema rengini kullan
                                 borderRadius: 1, // Kenarlık yuvarlatma
                                 backgroundColor: 'background.paper', // Arkaplan beyaz
                                 boxShadow: 1, // Hafif gölge
                                 transition: "box-shadow 0.3s ease-in-out",
                                 "&:hover": {
                                     boxShadow: 3, // Hover'da gölge artır
                                     backgroundColor: 'action.hover', // Hafif arkaplan değişimi
                                 },
                                 cursor: "pointer", // Tıklanabilir olduğunu belirt
                             }}
                             // Tıklama olayında seçilen grubu modala gönder
                             onClick={() => handleOpenModal(groupedItem)}
                         >
                             {/* Plan Adı ve Tarih */}
                             <Box sx={{ flexGrow: 1, mr: 2 }}> {/* Boşluk bırak */}
                                 <Typography
                                     variant="subtitle1" // Başlık yerine subtitle1 yapıldı
                                     fontWeight={600} // Kalın
                                     sx={{ color: 'text.primary' }} // Tema rengini kullan
                                 >
                                     {groupedItem.planName?.length > 40 ? `${groupedItem.planName.slice(0, 40)}...` : groupedItem.planName} {/* Uzun isimleri kısalt */}
                                 </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                                      <CalendarTodayIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} /> {/* İkon boyutu küçültüldü */}
                                       {new Date(groupedItem.date).toLocaleDateString()}
                                  </Typography>
                             </Box>

                             {/* Buton Grubu */}
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {/* Görüntüle Butonu */}
                                  {/* Görüntüle işlevini kutunun tamamına click vererek sağladık, ikon butona gerek yok */}
                                 {/* <IconButton
                                      sx={{ color: 'action.active' }} // Tema rengini kullan
                                  >
                                      <Visibility fontSize="small" />
                                  </IconButton> */}

                                  {/* Grubu Sil Butonu (isteğe bağlı - eğer tüm grubu silmek istenirse) */}
                                  {/* Şu anki onDelete sadece tekil meal entry siliyor, bu buton uygun değil */}
                                   {/* <IconButton
                                       aria-label="delete plan group"
                                       size="small"
                                       sx={{ color: red[500] }}
                                       onClick={(event) => {
                                           event.stopPropagation(); // Kutu click olayını engelle
                                           // Burada bu gruba ait tüm meal entryleri silme mantığı olmalı
                                           // Veya sadece temsilci mealEntry'i sil (handleDeleteMealEntry(groupedItem.firstMealId))
                                           console.log("Silme işlevi burada olacak:", groupedItem.key);
                                       }}
                                   >
                                       <DeleteIcon fontSize="small" />
                                   </IconButton> */}
                             </Box>
                         </Box>
                     ))
                 )}
            </Box>

            {/* Modal */}
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="meal-plan-modal-title"
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Box
                    sx={{
                        width: "90%",
                        maxWidth: 600, // Modal genişliği ayarlandı
                        bgcolor: "background.paper",
                        padding: { xs: 2, sm: 3 }, // Responsive padding
                        borderRadius: 2, // Kenarlık yuvarlatma
                        boxShadow: 5,
                        overflowY: "auto",
                        maxHeight: "90vh",
                        position: "relative",
                        border: '1px solid', // Kenarlık eklendi
                        borderColor: 'divider', // Tema rengini kullan
                    }}
                >
                    {/* Kapat Butonu */}
                    <IconButton
                        onClick={handleCloseModal}
                        sx={{
                            position: "absolute",
                            top: 8, // Konum ayarı
                            right: 8, // Konum ayarı
                            color: 'action.active', // Tema rengini kullan
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {/* Modal Başlığı (Plan Adı) */}
                     <Typography
                         id="meal-plan-modal-title"
                         variant="h6" // Modal başlığı h6 yapıldı
                         fontWeight={600}
                         gutterBottom
                         sx={{ mr: 4 }} // Kapat butonuna yer bırak
                     >
                         {selectedGroupForModal?.planName} Planı
                     </Typography>

                    {/* Modal Tarihi */}
                     {selectedGroupForModal?.date && (
                         <Typography variant="body2" color="text.secondary" sx={{ mb: 3, display: "flex", alignItems: "center" }}>
                             <CalendarTodayIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                             <strong>Tarih:</strong> {new Date(selectedGroupForModal.date).toLocaleDateString()}
                         </Typography>
                     )}

                    {/* Öğün Türlerine Göre Gruplanmış Yiyecek Listesi */}
                   {/* Öğün Türlerine Göre Gruplanmış Yiyecek Listesi */}
          {selectedGroupForModal && Object.entries(groupedMealsForModal(selectedGroupForModal)).map(([ogunTipi, ogunler]) => {
            // Makro değerlerin toplamlarını hesapla (Bu grubu oluşturan tüm öğün girdilerinin toplamı)
            const totalMakrolar = {
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
            };

            ogunler.forEach((ogun) => { // Her bir öğün girdisi (örn: 7 Mayıs Kahvaltı kaydı)
             // Bu öğün girdisindeki her bir yiyecek entry'si
              ogun.entries.forEach((girdi) => {
                // Yiyecek bilgilerinin geldiğinden emin olalım
                if (girdi.foodItem && girdi.amountInGrams > 0) { // amountInGrams kontrolü eklendi
                  const ratio = girdi.amountInGrams / 100; // Miktar oranını hesapla
                  totalMakrolar.calories += (girdi.foodItem.calories || 0) * ratio; // Oranla çarp
                  totalMakrolar.protein += (girdi.foodItem.protein || 0) * ratio; // Oranla çarp
                  totalMakrolar.carbs += (girdi.foodItem.carbs || 0) * ratio; // Oranla çarp
                  totalMakrolar.fat += (girdi.foodItem.fat || 0) * ratio; // Oranla çarp
                }
              });
            });

                        // Öğün türü için daha okunabilir bir metin oluştur
                        const ogunTipiMetin = {
                            breakfast: 'Kahvaltı',
                            lunch: 'Öğle',
                            dinner: 'Akşam',
                            snack: 'Ara Öğün',
                        }[ogunTipi] || ogunTipi; // Eğer eşleşmezse gelen değeri kullan

                        return (
                             // Her bir öğün türü (Kahvaltı, Öğle vb.) için bir Card
                             <Card key={ogunTipi} sx={{ mb: 2, boxShadow: 1, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}> {/* Gölge ve border ayarı */}
                                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}> {/* Padding ayarı */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                         <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'text.primary' }}> {/* Renk ve font ayarı */}
                                             {ogunTipiMetin}
                                         </Typography>
                                         {/* Öğün Girdisini Sil Butonu (Bu öğün türündeki tüm yiyecekleri içeren tekil kaydı siler) */}
                                         {/* NOT: Eğer bir öğün türünden (örn: Kahvaltı) o güne ait birden fazla kayıt varsa, buradaki silme o kaydı siler. */}
                                         {/* listede tekil yiyeceği silme işlevi bu component'ın mevcut prop'ları ve mantığıyla zor */}
                                          {/* Eğer bu öğün türü grubunda sadece bir öğün girdisi varsa (genellikle böyle beklenir) o girdiyi sileriz */}
                                           {ogunler.length === 1 && (
                                             <IconButton
                                                 edge="end"
                                                 aria-label={`delete ${ogunTipiMetin}`}
                                                 size="small"
                                                 sx={{ color: 'error.main' }} // Tema rengini kullan
                                                 onClick={() => handleDeleteMealEntry(ogunler[0].id)} // Bu öğün girdisinin ID'sini silme fonksiyonuna gönder
                                             >
                                                 <DeleteIcon fontSize="small" />
                                             </IconButton>
                                           )}
                                    </Box>


                                     <List dense disablePadding> {/* Padding sıfırlandı */}
                                         {ogunler.map((ogun) => // Her öğün girdisi içindeki yiyecekleri listele
                                             ogun.entries.map((girdi) => (
                                                 <ListItem key={girdi.id} sx={{ padding: "4px 0" }}>
                                                     <ListItemText
                                                         primary={girdi.foodItem?.name || 'Bilinmeyen Yiyecek'} // foodItem null/undefined olabilir
                                                         secondary={`${girdi.amountInGrams || 0}g`}
                                                     />
                                                      {/* Tekil yiyecek silme butonu, eğer bu özellik istenirse ve API destekliyorsa */}
                                                      {/* Şu anki handleDeleteMealEntry tüm öğün girdisini sildiği için buraya uygun değil */}
                                                      {/* <IconButton edge="end" aria-label="delete food item" size="small" sx={{ color: red[500] }}> <DeleteIcon /> </IconButton> */}
                                                 </ListItem>
                                             ))
                                         )}
                                     </List>

                                     {/* Toplam Makrolar */}
                                     <Box mt={2} px={1}>
                                         <Typography variant="body2" fontWeight="bold" sx={{ color: 'text.secondary' }}> {/* Renk ayarı */}
                                             Toplam: {totalMakrolar.calories.toFixed(0)} kcal — P: {totalMakrolar.protein.toFixed(0)}g, KH: {totalMakrolar.carbs.toFixed(0)}g, Y: {totalMakrolar.fat.toFixed(0)}g
                                         </Typography>
                                     </Box>
                                 </CardContent>
                             </Card>
                         );
                     })}


                    {/* Modal Kapat Butonu */}
                    <Box sx={{ textAlign: "center", mt: 3 }}>
                        <Button
                            variant="outlined"
                            onClick={handleCloseModal}
                             sx={{
                                 width: "100%", // Tam genişlik
                                 py: 1.2, // Dikey padding WorkoutCreate butonu gibi
                                 fontSize: "0.9rem", // Font boyutu WorkoutCreate butonu gibi
                                 fontWeight: 600,
                                 color: 'primary.main', // Tema rengini kullan
                                 borderColor: 'primary.main', // Tema rengini kullan
                                 borderRadius: 1, // Kenarlık yuvarlatma
                                 "&:hover": {
                                     backgroundColor: 'action.hover', // Hafif arkaplan değişimi
                                     borderColor: 'primary.main',
                                 },
                            }}
                        >
                            Kapat
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

export default MealList;