// Pakistani cities for the weather location picker. Broad coverage across every
// province and territory (major cities + district headquarters + notable towns).
// Values are plain city names; the weather proxy geocodes them scoped to country=PK,
// so names alone resolve correctly. Province is shown as a disambiguating hint.

export interface PkCity {
  name: string;
  province: string;
}

const group = (province: string, names: string[]): PkCity[] =>
  names.map((name) => ({ name, province }));

export const PK_CITIES: PkCity[] = [
  ...group("ICT", ["Islamabad"]),
  ...group("Punjab", [
    "Lahore", "Faisalabad", "Rawalpindi", "Gujranwala", "Multan", "Sargodha",
    "Sialkot", "Bahawalpur", "Sahiwal", "Sheikhupura", "Rahim Yar Khan", "Jhang",
    "Gujrat", "Kasur", "Okara", "Wah Cantonment", "Dera Ghazi Khan", "Chiniot",
    "Mandi Bahauddin", "Hafizabad", "Kamoke", "Muridke", "Jhelum", "Khanewal",
    "Attock", "Vehari", "Toba Tek Singh", "Nankana Sahib", "Muzaffargarh",
    "Khushab", "Layyah", "Mianwali", "Bhakkar", "Pakpattan", "Lodhran",
    "Narowal", "Chakwal", "Bahawalnagar", "Burewala", "Kot Addu", "Gojra",
    "Daska", "Wazirabad", "Jaranwala", "Chishtian", "Kamalia", "Ahmadpur East",
    "Kabirwala", "Hasilpur", "Arifwala", "Sambrial", "Shakargarh", "Jalalpur Jattan",
    "Taxila", "Murree", "Rajanpur", "Pind Dadan Khan", "Mailsi", "Bhalwal",
    "Sadiqabad", "Haroonabad", "Fort Abbas", "Chunian", "Pattoki", "Raiwind",
    "Shorkot", "Dunyapur", "Jampur", "Depalpur", "Talagang", "Fateh Jang",
    "Pindi Gheb", "Kallar Kahar", "Kharian", "Sarai Alamgir", "Renala Khurd",
    "Zafarwal", "Hujra Shah Muqim", "Ferozewala",
  ]),
  ...group("Sindh", [
    "Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah", "Mirpur Khas",
    "Jacobabad", "Shikarpur", "Khairpur", "Dadu", "Thatta", "Badin", "Ghotki",
    "Tando Allahyar", "Tando Adam", "Umerkot", "Kandhkot", "Kashmore", "Sanghar",
    "Naushahro Feroze", "Matiari", "Jamshoro", "Sujawal", "Tando Muhammad Khan",
    "Qambar", "Mehar", "Kotri", "Rohri", "Pano Aqil", "Gambat", "Digri", "Mithi",
    "Kot Diji", "Sehwan", "Moro", "Sakrand", "Hala", "Ratodero", "Warah", "Bhiria",
    "Nasarpur", "Shahdadpur", "Tando Bago", "Daharki", "Ubauro",
  ]),
  ...group("KP", [
    "Peshawar", "Mardan", "Mingora", "Kohat", "Abbottabad", "Dera Ismail Khan",
    "Bannu", "Swabi", "Nowshera", "Charsadda", "Mansehra", "Hangu", "Batkhela",
    "Timergara", "Haripur", "Tank", "Karak", "Lakki Marwat", "Chitral", "Dir",
    "Shabqadar", "Takht Bhai", "Parachinar", "Risalpur", "Havelian", "Topi",
    "Pabbi", "Daggar", "Alpuri", "Besham", "Dassu", "Matta", "Khar", "Ghalanai",
    "Miranshah", "Wana", "Jamrud", "Landi Kotal", "Battagram", "Balakot",
    "Kulachi", "Paharpur", "Lachi", "Cherat",
  ]),
  ...group("Balochistan", [
    "Quetta", "Turbat", "Khuzdar", "Chaman", "Hub", "Sibi", "Zhob", "Gwadar",
    "Dera Murad Jamali", "Dera Allah Yar", "Loralai", "Pishin", "Mastung",
    "Nushki", "Kalat", "Kharan", "Panjgur", "Qila Saifullah", "Qila Abdullah",
    "Dalbandin", "Usta Mohammad", "Jiwani", "Ormara", "Pasni", "Uthal", "Bela",
    "Dhadar", "Mach", "Ziarat", "Kohlu", "Dera Bugti", "Barkhan", "Musakhel",
    "Awaran", "Washuk", "Sohbatpur", "Harnai", "Surab", "Gandava",
  ]),
  ...group("Gilgit-Baltistan", [
    "Gilgit", "Skardu", "Chilas", "Gahkuch", "Astore", "Aliabad", "Karimabad",
    "Nagar", "Khaplu", "Shigar", "Danyor", "Gupis", "Yasin", "Sost", "Gakuch",
  ]),
  ...group("Azad Kashmir", [
    "Muzaffarabad", "Mirpur", "Kotli", "Rawalakot", "Bhimber", "Bagh",
    "Pallandri", "Hattian Bala", "Hajira", "Athmuqam", "Dadyal", "Khuiratta",
    "Sehnsa", "Nakyal", "Forward Kahuta",
  ]),
].sort((a, b) => a.name.localeCompare(b.name));
