// Firebase başlatma
const firebaseConfig = {
  apiKey: "AIzaSyCGEOWNSWTN9qmFS623zX8kH9yAyYCIdXI",
  authDomain: "calismatakvimi-e75c4.firebaseapp.com",
  projectId: "calismatakvimi-e75c4",
  storageBucket: "calismatakvimi-e75c4.firebasestorage.app",
  messagingSenderId: "541979758881",
  appId: "1:541979758881:web:1ac74c4a88c8864e37ee60",
  measurementId: "G-HLXWBYJ1RP",
  databaseURL: "https://calismatakvimi-e75c4-default-rtdb.europe-west1.firebasedatabase.app/"
};


// Firebase'i başlat
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Auth persistence ayarla - session persistence kullan (tarayıcı kapatıldığında oturum sonlanır)
auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
  .catch((error) => {
    console.error("Auth persistence error:", error);
  });

// Global değişkenler
let currentWeek = 0;
const weeks = [];
const subjects = ['Türkçe', 'Matematik', 'Fen Bilgisi', 'Sosyal Bilgiler', 'İngilizce', 'Din Kültürü ve Ahlak Bilgisi'];
const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

// DOM elementlerini seç
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const authMessage = document.getElementById('auth-message');

// Başlangıç durumunu ayarla
authContainer.classList.remove('hidden');
appContainer.classList.add('hidden');

// Sayfa yüklendiğinde otomatik girişi engelle
window.addEventListener('load', () => {
  // Mevcut oturumu sonlandır
  auth.signOut().then(() => {
    // Tüm oturum verilerini temizle
    localStorage.clear();
    sessionStorage.clear();
  }).catch((error) => {
    console.error("Oturum sonlandırma hatası:", error);
  });
});

// Auth fonksiyonları
const login = async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  
  try {
    await auth.signInWithEmailAndPassword(email, password);
    authMessage.textContent = '';
  } catch (error) {
    authMessage.textContent = error.message;
  }
};

const signup = async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  
  try {
    await auth.createUserWithEmailAndPassword(email, password);
    authMessage.textContent = 'Kayıt başarılı! Giriş yapılıyor...';
  } catch (error) {
    authMessage.textContent = error.message;
  }
};

const logout = async () => {
  try {
    await auth.signOut();
    // Tüm oturum verilerini temizle
    localStorage.clear();
    sessionStorage.clear();
    // Sayfayı yeniden yükle (cache'i bypass et)
    window.location.reload(true);
  } catch (error) {
    console.error("Çıkış yapılırken hata:", error);
  }
};

// Auth state listener
auth.onAuthStateChanged(user => {
  if (user) {
    // Kullanıcı giriş yapmışsa
    authContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');
    loadData();
  } else {
    // Kullanıcı giriş yapmamışsa
    authContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
    weeks.length = 0;
    currentWeek = 0;
  }
});

// Auth event listeners
loginBtn.addEventListener('click', login);
signupBtn.addEventListener('click', signup);
logoutBtn.addEventListener('click', logout);

// Veritabanı referansı
const getDbRef = () => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Kullanıcı girişi yapılmamış");
  return database.ref(`users/${userId}/calismaProgrami`);
};

// Verileri Firebase'e kaydet
const saveData = async () => {
  const data = {
    currentWeek: currentWeek,
    weeks: weeks
  };
  try {
    await getDbRef().set(data);
    console.log("Veri kaydedildi!");
  } catch (err) {
    console.error("Hata:", err);
  }
};

// Date ekleme fonksiyonu
Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}


// Firebase'den veri yükle
const loadData = async () => {
  try {
    const snapshot = await getDbRef().once('value');
    const data = snapshot.val();
    if (data) {
      currentWeek = data.currentWeek || 0;
      weeks.length = 0;
      weeks.push(...(data.weeks || []));
      if(weeks.length === 0) weeks.push(createNewWeek());
      updateTable();
    }
  } catch (err) {
    console.error("Yükleme hatası:", err);
  }
};

// Yeni hafta oluştur
const createNewWeek = () => {
  let startDate = weeks.length === 0 ? 
    new Date('2025-05-12') : 
    new Date(new Date(weeks[weeks.length-1].days[6].date).setDate(
      new Date(weeks[weeks.length-1].days[6].date).getDate() + 1
    ));

  return {
    startDate: startDate,
    days: Array.from({length:7}, (_,i) => {
      const date = new Date(startDate);
      date.setDate(date.addDays(i)).toString();
      return {
        date: date,
        subjects: subjects.reduce((acc, subject) => {
          acc[subject] = '';
          return acc;
        }, {})
      };
    })
  };
};

// Tabloyu güncelle
const updateTable = () => {
  const tableBody = document.getElementById('table-body');
  tableBody.innerHTML = '';

  weeks[currentWeek].days.forEach((day, dayIndex) => {
    const row = document.createElement('tr');
    
    // Tarih hücresi
    const dateCell = document.createElement('td');
    let new_tarih = new Date(Date.parse(day.date));
    dateCell.textContent = `${days[dayIndex]} (${new_tarih.toLocaleDateString('tr-TR')})`;
    dateCell.style.fontWeight = 'bold';
    row.appendChild(dateCell);

    // Ders hücreleri
    subjects.forEach(subject => {
      const cell = document.createElement('td');
      cell.contentEditable = true;
      cell.className = 'editable-cell';
      cell.textContent = day.subjects[subject] || '';
      
      cell.addEventListener('blur', () => {
        weeks[currentWeek].days[dayIndex].subjects[subject] = cell.textContent;
        saveData();
      });
      
      row.appendChild(cell);
    });
    
    tableBody.appendChild(row);
  });
};

// Buton eventleri
document.getElementById('prev-week').addEventListener('click', () => {
  if(currentWeek > 0) {
    currentWeek--;
    updateTable();
    saveData();
  }
});

document.getElementById('next-week').addEventListener('click', () => {
  if(currentWeek >= weeks.length-1) {
    weeks.push(createNewWeek());
  }
  currentWeek++;
  updateTable();
  saveData();
});

document.getElementById('print-pdf').addEventListener('click', () => window.print());