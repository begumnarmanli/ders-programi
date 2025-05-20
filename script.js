// Firebase Yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyCGEOWNSWTN9qmFS623zX8kH9yAyYCIdXI",
  authDomain: "calismatakvimi-e75c4.firebaseapp.com",
  databaseURL: "https://calismatakvimi-e75c4-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "calismatakvimi-e75c4",
  storageBucket: "calismatakvimi-e75c4.firebasestorage.app",
  messagingSenderId: "541979758881",
  appId: "1:541979758881:web:1ac74c4a88c8864e37ee60",
  measurementId: "G-HLXWBYJ1RP"
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Oturum Kalıcılığını Ayarla (Tarayıcı kapatıldığında oturum sonlanır)
auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
  .catch((error) => {
    console.error("Oturum kalıcılığı ayarlanırken hata:", error);
  });

// Sabit Değişkenler
const subjects = [
  'Türkçe',
  'Matematik',
  'Fen Bilgisi',
  'Sosyal Bilgiler',
  'İngilizce',
  'Din Kültürü ve Ahlak Bilgisi'
];

const days = [
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
  'Pazar'
];

// Global Değişkenler
let currentWeek = 0;
const weeks = [];

// DOM Elementleri
let authContainer, appContainer, emailInput, passwordInput, loginBtn, signupBtn, logoutBtn, authMessage;
let logoutModal, cancelLogoutBtn, confirmLogoutBtn;

// DOM Elementlerini Yükle
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elementlerini Seç
  authContainer = document.getElementById('auth-container');
  appContainer = document.getElementById('app-container');
  emailInput = document.getElementById('email');
  passwordInput = document.getElementById('password');
  loginBtn = document.getElementById('login-btn');
  signupBtn = document.getElementById('signup-btn');
  logoutBtn = document.getElementById('logout-btn');
  authMessage = document.getElementById('auth-message');
  logoutModal = document.getElementById('logout-modal');
  cancelLogoutBtn = document.getElementById('cancel-logout');
  confirmLogoutBtn = document.getElementById('confirm-logout');

  // Başlangıç durumunu ayarla
  if (authContainer && appContainer) {
    authContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
  }

  // Login fonksiyonu
  const login = async () => {
    console.log("Login fonksiyonu çağrıldı");
    
    // DOM elementlerini kontrol et
    if (!emailInput || !passwordInput || !authMessage) {
      console.error("Gerekli DOM elementleri bulunamadı");
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    console.log("Email:", email);
    console.log("Password:", password);

    // Boş alan kontrolü
    if (!email || !password) {
      console.log("Boş alan tespit edildi");
      authMessage.textContent = 'Lütfen e-posta ve şifre girin.';
      authMessage.style.color = 'red';
      // Giriş ekranında kal
      authContainer.classList.remove("hidden");
      appContainer.classList.add("hidden");
      return;
    }

    // E-posta formatı kontrolü
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      console.log("Geçersiz e-posta formatı");
      authMessage.textContent = 'Lütfen geçerli bir e-posta adresi girin.';
      authMessage.style.color = 'red';
      // Giriş ekranında kal
      authContainer.classList.remove("hidden");
      appContainer.classList.add("hidden");
      return;
    }

    // Şifre uzunluğu kontrolü
    if (password.length < 6) {
      console.log("Şifre çok kısa");
      authMessage.textContent = 'Şifreniz en az 6 karakter olmalıdır.';
      authMessage.style.color = 'red';
      // Giriş ekranında kal
      authContainer.classList.remove("hidden");
      appContainer.classList.add("hidden");
      return;
    }

    try {
      console.log("Firebase giriş denemesi yapılıyor...");
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      
      if (!userCredential || !userCredential.user) {
        console.error("Geçersiz kullanıcı bilgileri");
        throw new Error('Geçersiz kullanıcı bilgileri');
      }

      console.log("Giriş başarılı");
      // Giriş başarılı
      authMessage.textContent = 'Giriş başarılı! Yönlendiriliyorsunuz...';
      authMessage.style.color = 'green';

    } catch (error) {
      console.error("Giriş hatası:", error);
      
      // Hata durumunda login ekranında kal
      authContainer.classList.remove("hidden");
      appContainer.classList.add("hidden");

      // Şifre alanını temizle
      passwordInput.value = '';
      passwordInput.focus();

      // Hata mesajlarını göster
      switch (error.code) {
        case 'auth/invalid-email':
          authMessage.textContent = 'Geçersiz e-posta adresi.';
          break;
        case 'auth/user-not-found':
          authMessage.textContent = 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.';
          break;
        case 'auth/wrong-password':
          authMessage.textContent = 'Girdiğiniz şifre yanlış.';
          break;
        case 'auth/internal-error':
          authMessage.textContent = 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.';
          break;
        case 'auth/too-many-requests':
          authMessage.textContent = 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.';
          break;
        default:
          authMessage.textContent = 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.';
      }
      authMessage.style.color = 'red';
    }
  };

  // Event Listener'ları Ekle
  if (loginBtn) loginBtn.addEventListener('click', login);
  if (signupBtn) signupBtn.addEventListener('click', signup);
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (logoutModal) logoutModal.classList.remove('hidden');
    });
  }
  if (cancelLogoutBtn) {
    cancelLogoutBtn.addEventListener('click', () => {
      if (logoutModal) logoutModal.classList.add('hidden');
    });
  }
  if (confirmLogoutBtn) {
    confirmLogoutBtn.addEventListener('click', () => {
      if (logoutModal) logoutModal.classList.add('hidden');
      logout();
    });
  }

  // Modal dışına tıklandığında kapat
  window.addEventListener('click', (event) => {
    if (event.target === logoutModal) {
      logoutModal.classList.add('hidden');
    }
  });
});

// Auth state listener
auth.onAuthStateChanged(async user => {
  if (user) {
    // Kullanıcı doğrulama
    if (!user.email || !user.uid) {
      console.error("Geçersiz kullanıcı bilgileri");
      await auth.signOut();
      return;
    }

    // Giriş başarılı
    if (authContainer) authContainer.classList.add('hidden');
    if (appContainer) appContainer.classList.remove('hidden');
    
    try {
      await loadData(user);
    } catch (error) {
      console.error("Veri yüklenirken hata:", error);
      // Hata durumunda çıkış yap
      await auth.signOut();
    }
  } else {
    // Kullanıcı giriş yapmamış
    if (authContainer) authContainer.classList.remove('hidden');
    if (appContainer) appContainer.classList.add('hidden');
    weeks.length = 0;
    currentWeek = 0;
  }
});

// Kayıt Fonksiyonu
const signup = async () => {
  if (!emailInput || !passwordInput || !authMessage) {
    console.error("Gerekli DOM elementleri bulunamadı");
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  // Boş alan kontrolü
  if (!email || !password) {
    authMessage.textContent = 'Lütfen e-posta ve şifre girin.';
    authMessage.style.color = 'red';
    return;
  }

  // E-posta formatı kontrolü
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    authMessage.textContent = 'Lütfen geçerli bir e-posta adresi girin.';
    authMessage.style.color = 'red';
    return;
  }

  // Şifre uzunluğu kontrolü
  if (password.length < 6) {
    authMessage.textContent = 'Şifreniz en az 6 karakter olmalıdır.';
    authMessage.style.color = 'red';
    return;
  }

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    
    // Otomatik giriş olduğu için çıkış yapıyoruz
    await auth.signOut();
    
    authMessage.textContent = 'Kayıt başarılı! Lütfen giriş yapın.';
    authMessage.style.color = 'green';
    
  } catch (error) {
    console.error("Kayıt hatası:", error);
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        authMessage.textContent = 'Bu e-posta adresi zaten kullanımda.';
        break;
      case 'auth/invalid-email':
        authMessage.textContent = 'Geçersiz e-posta adresi.';
        break;
      case 'auth/operation-not-allowed':
        authMessage.textContent = 'E-posta/şifre girişi devre dışı bırakılmış.';
        break;
      case 'auth/weak-password':
        authMessage.textContent = 'Şifre çok zayıf. En az 6 karakter kullanın.';
        break;
      default:
        authMessage.textContent = 'Kayıt işlemi başarısız. Lütfen tekrar deneyin.';
    }
    authMessage.style.color = 'red';
  }
};

// Çıkış Fonksiyonu
const logout = async () => {
  try {
    await auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload(true);
  } catch (error) {
    console.error("Çıkış yapılırken hata oluştu:", error);
    authMessage.textContent = "Çıkış yapılırken bir hata oluştu. Lütfen tekrar deneyin.";
    authMessage.style.color = "red";
  }
};

// Yardımcı Fonksiyonlar
const showApp = async (user) => {
  authContainer.classList.add('hidden');
  appContainer.classList.remove('hidden');
  try {
    await loadData(user);
  } catch (error) {
    console.error("Veri yüklenirken hata:", error);
  }
};

const showAuth = () => {
  authContainer.classList.remove('hidden');
  appContainer.classList.add('hidden');
  weeks.length = 0;
  currentWeek = 0;
};

// Hata İşleme Fonksiyonu
const handleAuthError = (error) => {
  console.error("Hata:", error);
  let errorMessage = '';

  switch (error.code) {
    case 'auth/invalid-email':
      errorMessage = 'Geçersiz e-posta adresi.';
      break;
    case 'auth/user-not-found':
      errorMessage = 'Kullanıcı bulunamadı.';
      break;
    case 'auth/wrong-password':
      errorMessage = 'Yanlış şifre.';
      break;
    case 'auth/email-already-in-use':
      errorMessage = 'Bu e-posta adresi zaten kullanımda.';
      break;
    case 'auth/weak-password':
      errorMessage = 'Şifre çok zayıf. En az 6 karakter kullanın.';
      break;
    default:
      errorMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.';
  }

  authMessage.textContent = errorMessage;
  authMessage.style.color = 'red';
};

// Veritabanı İşlemleri
const getDbRef = (user) => {
  if (!user) throw new Error("Kullanıcı girişi yapılmamış");
  return database.ref(`users/${user.uid}/calismaProgrami`);
};

// Verileri Firebase'e kaydet
const saveData = async () => {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const data = {
    currentWeek: currentWeek,
    weeks: weeks
  };
  try {
    await getDbRef(user).set(data);
    console.log("Veri kaydedildi!");
  } catch (err) {
    console.error("Hata:", err);
  }
};

// Verileri Firebase'den yükle
const loadData = async (user) => {
  try {
    const snapshot = await getDbRef(user).once('value');
    const data = snapshot.val();
    
    if (data) {
      currentWeek = data.currentWeek || 0;
      weeks.length = 0;
      weeks.push(...(data.weeks || []));
      
      if (weeks.length === 0) {
        weeks.push(createNewWeek());
        saveData();
      }
      updateTable();
    } else {
      weeks.length = 0;
      weeks.push(createNewWeek());
      updateTable();
      saveData();
    }
  } catch (err) {
    console.error("Yükleme hatası:", err);
    weeks.length = 0;
    weeks.push(createNewWeek());
    updateTable();
    saveData();
  }
};

// Yeni hafta oluştur
Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}
function getStartOfWeek(date) {
  const d = new Date(date); // Tarihin kopyası
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Pazartesi'yi başlangıç kabul ediyoruz
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0); // Saat bilgisi sıfırlanıyor
  return d;
}

function goToDate() {
  const input = document.getElementById("date-picker");
  const dateStr = input.value;  // Bu 'd.m.Y' formatında string olur

  if (!dateStr) {
    alert("Lütfen geçerli bir tarih girin.");
    return;
  }

  const parts = dateStr.split('.');
  if (parts.length !== 3) {
    alert("Lütfen geçerli bir tarih girin.");
    return;
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);

  const selectedDate = new Date(year, month, day);

  if (isNaN(selectedDate.getTime())) {
    alert("Lütfen geçerli bir tarih girin.");
    return;
  }

  const startOfWeek = getStartOfWeek(selectedDate);

  const startOfWeekStr = startOfWeek.toDateString();

  let weekIndex = weeks.findIndex(w => new Date(w.startDate).toDateString() === startOfWeekStr);

  if (weekIndex === -1) {
    const newWeek = createNewWeekFromDate(startOfWeek);
    weeks.push(newWeek);
    weekIndex = weeks.length - 1;
  }

  currentWeek = weekIndex;
  updateTable();
  saveData();
}


const createNewWeekFromDate = (startDate) => {
  return {
    startDate: startDate,
    days: Array.from({length:7}, (_, i) => {
      const date = startDate.addDays(i);
      return {
        date1: date,
        subjects: subjects.reduce((acc, subject) => {
          acc[subject] = '';
          return acc;
        }, {}),
        date: date.toString()
      };
    })
  };
};


// Yeni hafta oluştur
const createNewWeek = () => {
  let startDate2 = weeks.length === 0 ? 
    new Date('2025-05-12') : 
    new Date(new Date(weeks[weeks.length-1].days[6].date).setDate(
      new Date(weeks[weeks.length-1].days[6].date).getDate() + 1
    ));

  return {
    startDate: startDate2,
    days: Array.from({length:7}, (_,i) => {
      startDate1 = startDate2.addDays(i);
      return {
        date1: startDate1,
        subjects: subjects.reduce((acc, subject) => {
          acc[subject] = '';
          return acc;
        }, {}),
        date2 : "deneme",
        date : startDate1.toString()
      };
    })
  };
};

// Tabloyu güncelle
const updateTable = () => {
  const tableBody = document.getElementById('table-body');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';

  if (!weeks[currentWeek] || !weeks[currentWeek].days) {
    console.error("Hafta verisi bulunamadı");
    return;
  }

  weeks[currentWeek].days.forEach((day, dayIndex) => {
    const row = document.createElement('tr');
    
    // Tarih hücresi
    const dateCell = document.createElement('td');
    const date = new Date(day.date); // ISO string'i Date objesine çevir
    dateCell.textContent = `${days[dayIndex]} (${date.toLocaleDateString('tr-TR')})`;
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

document.getElementById('save').addEventListener('click', () => {
  saveData();

  // "Kaydedildi" mesajını göster
  const saveMessage = document.getElementById("save-message");
  saveMessage.classList.remove("hidden");

  // 3 saniye sonra mesajı gizle
  setTimeout(() => {
    saveMessage.classList.add("hidden");
  }, 3000);
});

document.getElementById('print-pdf').addEventListener('click', () => window.print());

document.addEventListener("DOMContentLoaded", function () {
  flatpickr("#date-picker", {
    dateFormat: "d.m.Y",
    locale: "tr",
    defaultDate: "19.05.2024",
    onChange: function(selectedDates, dateStr) {
      goToDate();
    }
  });
});

// Firebase verilerini sıfırla
const resetData = async () => {
  const user = firebase.auth().currentUser;
  if (!user) return;
  
  try {
    await getDbRef(user).remove();
    weeks.length = 0;
    currentWeek = 0;
    weeks.push(createNewWeek());
    updateTable();
    console.log("Veriler sıfırlandı!");
  } catch (err) {
    console.error("Sıfırlama hatası:", err);
  }
}; 