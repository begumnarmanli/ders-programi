// Firebase başlatma
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
// Modal Elementleri
const logoutModal = document.getElementById('logout-modal');
const cancelLogoutBtn = document.getElementById('cancel-logout');
const confirmLogoutBtn = document.getElementById('confirm-logout');

// Başlangıç durumunu ayarla
authContainer.classList.remove('hidden');
appContainer.classList.add('hidden');



// Kayıt fonksiyonu buraya eklenebilir
function registerUser(email, password) {
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Otomatik giriş olduğu için çıkış yapıyoruz:
      auth.signOut().then(() => {
        // Kullanıcı çıkış yaptıktan sonra mesajı göster
        document.getElementById("message").innerText = "Kayıt başarılı! Lütfen giriş yap butonuna tıklayın.";
      });
    })
    .catch((error) => {
      document.getElementById("message").innerText = "Kayıt hatası: " + error.message;
    });
}

// Çıkış yapma fonksiyonu zaten mevcut
const logout = () => {
  auth.signOut().then(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload(true);
  }).catch((error) => {
    console.error("Çıkış yapılırken hata oluştu:", error);
  });
};

// Sayfa yüklendiğinde çalışacak kodlar
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout-btn');
  const logoutModal = document.getElementById('logout-modal');
  const cancelLogoutBtn = document.getElementById('cancel-logout');
  const confirmLogoutBtn = document.getElementById('confirm-logout');

  if (!logoutBtn) {
    console.warn('logout-btn elementi bulunamadı!');
  } else {
    logoutBtn.addEventListener('click', () => {
      console.log('Çıkış yap butonuna tıklandı!');
      logoutModal.classList.remove('hidden');
    });
  }

  if (cancelLogoutBtn) {
    cancelLogoutBtn.addEventListener('click', () => {
      logoutModal.classList.add('hidden');
    });
  }

  if (confirmLogoutBtn) {
    confirmLogoutBtn.addEventListener('click', () => {
      logoutModal.classList.add('hidden');
      logout();
    });
  }

  window.addEventListener('click', (event) => {
    if (event.target === logoutModal) {
      logoutModal.classList.add('hidden');
    }
  });
});



// Auth fonksiyonları
const login = async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  try {
    await auth.signInWithEmailAndPassword(email, password);
    authMessage.textContent = '';
  } catch (error) {
    console.error("Hata objesi:", error);

    let errorCode = error.code;

    // Eğer errorCode auth/internal-error ise, detaylı kontrol için message içini kontrol et
    if (errorCode === 'auth/internal-error' && error.message) {
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.error && parsed.error.message) {
          errorCode = parsed.error.message; 
        }
      } catch (e) {
        // JSON parse başarısızsa buraya gelir, normal mesaj kalır
      }
    }

    switch (errorCode) {
      case 'auth/invalid-email':
        authMessage.textContent = 'Geçersiz e-posta adresi.';
        break;
      case 'auth/user-not-found':
        authMessage.textContent = 'Kullanıcı bulunamadı.';
        break;
      case 'auth/wrong-password':
        authMessage.textContent = 'Yanlış şifre.';
        break;
      case 'INVALID_LOGIN_CREDENTIALS':
        authMessage.textContent = 'E-posta veya şifre yanlış.';
        break;
      default:
        authMessage.textContent = 'Bir hata oluştu. Lütfen tekrar deneyin.';
    }

    authMessage.style.color = 'red';
  }
};






const signup = async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    await auth.createUserWithEmailAndPassword(email, password);
    authMessage.textContent = 'Kayıt başarılı. Giriş yapabilirsiniz.';
    authMessage.style.color = 'green';
  } catch (error) {
  console.error("Hata objesi:", error);

  if (error.code === 'auth/invalid-email') {
    authMessage.textContent = "Geçersiz e-posta adresi.";
  } else if (error.code === 'auth/wrong-password') {
    authMessage.textContent = "Yanlış şifre.";
  } else if (error.code === 'auth/user-not-found') {
    authMessage.textContent = "Kullanıcı bulunamadı.";
  } else {
    authMessage.textContent = "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.";
  }

  authMessage.style.color = "red";
}

};

// Firebase'den veri yükle
const loadData = async (user) => {
  try {
    const snapshot = await getDbRef(user).once('value');
    const data = snapshot.val();
    if (data) {
      currentWeek = data.currentWeek || 0;
      weeks.length = 0;
      weeks.push(...(data.weeks || []));
      if (weeks.length === 0) weeks.push(createNewWeek());
      updateTable();
    } else {
      weeks.length = 0;
      weeks.push(createNewWeek());
      updateTable();
      saveData(); // Yeni programı kaydet
    }
  } catch (err) {
    console.error("Yükleme hatası:", err);
    weeks.length = 0;
    weeks.push(createNewWeek());
    updateTable();
  }
};

// Auth state listener
auth.onAuthStateChanged(async user => {
  if (user) {
    authContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');

    // user varsa ve tanımlıysa, veri yüklemeye çalış
    try {
      await loadData(user);
    } catch (error) {
      console.error("loadData sırasında hata:", error);
    }

  } else {
    authContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
    weeks.length = 0;
    currentWeek = 0;
  }
});


// Auth event listeners
loginBtn.addEventListener('click', login);
signupBtn.addEventListener('click', signup);
// logoutBtn.addEventListener('click', logout);


// Veritabanı referansı
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
    defaultDate: "today",
    onChange: function(selectedDates, dateStr) {
      // Tarih değiştiğinde goToDate fonksiyonunu çağır
      goToDate();
    }
  });
}); 
