const fs = require('fs');
const path = require('path');

const HASH = '$2a$10$vwH52koZwOEJvmS3BteMmezFheq/Kg.FFLVpqbT1jkuoNeQGEYTeq';

function iso(daysAgo) {
  const d = new Date('2025-08-25T00:00:00Z');
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

function uid(prefix, n) {
  return prefix + '_' + String(n).padStart(3, '0');
}

// ===== ADMIN USERS =====
const admins = [
  { id: 'usr_adm_001', name: 'Dr. K. Senthilvel', email: 'senthilvel@tn.gov.in', phone: '+91 98400 12345', role: 'super_admin', address: 'Corporation of Chennai, Ripon Buildings, 3rd Floor', district: 'Chennai Central', lat: 13.0827, lng: 80.2707 },
  { id: 'usr_adm_002', name: 'M. Balachandar', email: 'balachandar@tn.gov.in', phone: '+91 94430 67890', role: 'admin', address: 'Chennai Corporation Zonal Office, T. Nagar', district: 'T. Nagar', lat: 13.0418, lng: 80.2341 },
  { id: 'usr_adm_003', name: 'S. Revathi', email: 'revathi@coimbatore.gov.in', phone: '+91 97890 11223', role: 'admin', address: 'Coimbatore City Municipal Corporation, Town Hall', district: 'Gandhipuram', lat: 11.0168, lng: 76.9558 },
  { id: 'usr_adm_004', name: 'P. Karthikeyan', email: 'karthikeyan@madurai.gov.in', phone: '+91 95000 44556', role: 'admin', address: 'Madurai Corporation Office, Alagar Koil Road', district: 'Madurai Central', lat: 9.9252, lng: 78.1198 },
  { id: 'usr_adm_005', name: 'V. Anandhakrishnan', email: 'anandhak@trichy.gov.in', phone: '+91 98765 78901', role: 'admin', address: 'Tiruchirappalli City Municipal Corporation, Medical College Road', district: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047 },
];

// ===== CONTRACTOR USERS =====
const contractors = [
  { id: 'usr_ctr_001', name: 'Sri Vijayan Road Contractors', email: 'contact@sriwijayanroads.in', phone: '+91 98400 22334', district: 'T. Nagar', lat: 13.0405, lng: 80.2335, specialty: 'Asphalt Patching & Pothole Repair', teamSize: 18, rating: 4.6, completedJobs: 156 },
  { id: 'usr_ctr_002', name: 'Kaveri Infrastructure Pvt Ltd', email: 'projects@kaveriinfra.com', phone: '+91 94430 55667', district: 'Adyar', lat: 13.0067, lng: 80.2563, specialty: 'Full-Depth Road Repair', teamSize: 24, rating: 4.8, completedJobs: 210 },
  { id: 'usr_ctr_003', name: 'Palk Straits Constructions', email: 'office@palkstraits.in', phone: '+91 97890 88990', district: 'Velachery', lat: 12.9815, lng: 80.2180, specialty: 'Surface Treatment & Resurfacing', teamSize: 15, rating: 4.3, completedJobs: 89 },
  { id: 'usr_ctr_004', name: 'Nellai Road Works', email: 'enquiry@nellairoads.com', phone: '+91 95000 11223', district: 'Tirunelveli', lat: 8.7139, lng: 77.7567, specialty: 'Cold-Mix Patching & Emergency Repair', teamSize: 10, rating: 4.1, completedJobs: 64 },
  { id: 'usr_ctr_005', name: 'Western Ghats Pavements', email: 'ops@westernghatspavements.in', phone: '+91 98765 33445', district: 'Gandhipuram', lat: 11.0098, lng: 76.9781, specialty: 'Asphalt Overlay & Road Rehabilitation', teamSize: 20, rating: 4.5, completedJobs: 132 },
  { id: 'usr_ctr_006', name: 'Thirumalai Construction Co', email: 'work@thirumaiconstructions.in', phone: '+91 94430 77889', district: 'Madurai Central', lat: 9.9312, lng: 78.1198, specialty: 'Pothole Filling & Edge Repair', teamSize: 12, rating: 4.4, completedJobs: 98 },
  { id: 'usr_ctr_007', name: 'Cauvery Road Solutions', email: 'info@cauveryroads.com', phone: '+91 97890 55667', district: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047, specialty: 'Deep Patch & Structural Repair', teamSize: 16, rating: 4.2, completedJobs: 76 },
  { id: 'usr_ctr_008', name: 'Salem Asphalt Works', email: 'contact@salemasphalt.in', phone: '+91 95000 99001', district: 'Salem', lat: 11.6643, lng: 78.1460, specialty: 'Pavement Milling & Overlay', teamSize: 14, rating: 4.0, completedJobs: 52 },
  { id: 'usr_ctr_009', name: 'Coromandel Infra Services', email: 'projects@coromandelinfraservices.in', phone: '+91 98400 44556', district: 'Manapakkam', lat: 13.0105, lng: 80.1682, specialty: 'Sinkhole Remediation & Earthwork', teamSize: 22, rating: 4.7, completedJobs: 178 },
  { id: 'usr_ctr_010', name: 'Pondy Coastal Builders', email: 'admin@pondycoastal.in', phone: '+91 94430 22334', district: 'Pondicherry', lat: 11.9416, lng: 79.8083, specialty: 'Coastal Road Maintenance & Patching', teamSize: 8, rating: 3.9, completedJobs: 41 },
];

// ===== CITIZEN USERS =====
const citizenData = [
  ['Arun Prakash','arun.prakash@gmail.com','+91 98400 12345','12, South Mada Street, T. Nagar, Chennai','T. Nagar',13.0418,80.2341],
  ['Lakshmi Devi','lakshmi.devi@gmail.com','+91 94430 23456','34, Lattice Bridge Road, Adyar, Chennai','Adyar',13.0067,80.2563],
  ['Mohammed Irfan','m.irfan@yahoo.com','+91 97890 34567','78, Velachery Main Road, Velachery, Chennai','Velachery',12.9815,80.2180],
  ['Sundar Rajan','sundar.rajan@outlook.com','+91 95000 45678','5, 2nd Avenue, Anna Nagar, Chennai','Anna Nagar',13.0850,80.2101],
  ['Kavitha Shanmugam','kavitha.s@gmail.com','+91 98765 56789','23, Ashok Nagar 3rd Main Road, Chennai','Ashok Nagar',13.0475,80.2168],
  ['Ranjith Kumar','ranjith.k@rediffmail.com','+91 94430 67890','45, Sholinganallur IT Expressway, Chennai','Sholinganallur',12.9010,80.2279],
  ['Deepa Venkatesh','deepa.v@gmail.com','+91 98400 78901','18, Chromepet Main Road, Chennai','Chromepet',12.9516,80.1412],
  ['Prakash Sundaram','prakash.s@yahoo.com','+91 97890 89012','67, Tambaram Sanatorium Road, Chennai','Tambaram',12.9249,80.1000],
  ['Sangeetha Ravi','sangeetha.r@gmail.com','+91 95000 90123','9, Kodambakkam High Road, Chennai','Kodambakkam',13.0518,80.2260],
  ['Thangamani Pillai','thangamani.p@outlook.com','+91 98765 01234','22, Thiruvanmiyur Beach Road, Chennai','Thiruvanmiyur',12.9830,80.2630],
  ['Vijay Anand','vijay.anand@gmail.com','+91 94430 12345','51, T Nagar 1st Main Road, Chennai','T. Nagar',13.0400,80.2360],
  ['Priya Murugan','priya.m@yahoo.com','+91 98400 23456','33, Adyar Bridge Road, Chennai','Adyar',13.0050,80.2580],
  ['Ashok Kumar','ashok.k@gmail.com','+91 97890 34567','88, Velachery Tambaram Main Road, Chennai','Velachery',12.9830,80.2150],
  ['Divya Shankar','divya.s@rediffmail.com','+91 95000 45678','14, Anna Nagar West Extension, Chennai','Anna Nagar',13.0870,80.2080],
  ['Mohan Das','mohan.d@gmail.com','+91 98765 56789','67, Ashok Nagar 100 Feet Road, Chennai','Ashok Nagar',13.0490,80.2150],
  ['Anitha Krishnan','anitha.k@yahoo.com','+91 94430 67890','29, Sholinganallur Navalur Road, Chennai','Sholinganallur',12.9030,80.2260],
  ['Rajesh Nair','rajesh.n@outlook.com','+91 98400 78901','55, Chromepet Radial Road, Chennai','Chromepet',12.9530,80.1390],
  ['Selvam Rajendran','selvam.r@gmail.com','+91 97890 89012','41, Tambaram SEL Vellakal, Chennai','Tambaram',12.9260,80.0980],
  ['Meena Subramanian','meena.s@yahoo.com','+91 95000 90123','16, Kodambakkam Salai, Chennai','Kodambakkam',13.0530,80.2240],
  ['Kumaravel Mudaliar','kumaravel.m@rediffmail.com','+91 98765 01234','72, Thiruvanmiyur Temple Road, Chennai','Thiruvanmiyur',12.9850,80.2610],
  ['Ilango Durai','ilango.d@gmail.com','+91 94430 12345','38, Gandhipuram 4th Street, Coimbatore','Gandhipuram',11.0168,76.9558],
  ['Ramya Balasubramanian','ramya.b@yahoo.com','+91 98400 23456','21, Peelamedu Avinashi Road, Coimbatore','Peelamedu',11.0300,76.9900],
  ['Ganapathi Suresh','ganapathi.s@gmail.com','+91 97890 34567','9, RS Puram Cross Street, Coimbatore','RS Puram',11.0050,76.9530],
  ['Vanitha Mohan','vanitha.m@outlook.com','+91 95000 45678','64, Singanallur OS Road, Coimbatore','Singanallur',11.0120,77.0100],
  ['Karthik Raj','karthik.raj@gmail.com','+91 98765 56789','15, KK Nagar 6th Street, Madurai','KK Nagar',9.9460,78.1220],
  ['Saranya Kumari','saranya.k@yahoo.com','+91 94430 67890','28, Alagar Koil Road, Madurai','Madurai Central',9.9280,78.1180],
  ['Marimuthu Gounder','marimuthu.g@gmail.com','+91 98400 78901','43, Pasumalai Hill Road, Madurai','Pasumalai',9.9180,78.1300],
  ['Poongodi Shanmugam','poongodi.s@rediffmail.com','+91 97890 89012','57, Thiruppalai Main Road, Madurai','Thiruppalai',9.9600,78.1400],
  ['Ramanathan Settu','ramanathan.s@gmail.com','+91 95000 01234','19, Attur Bazaar Road, Salem','Salem',11.6643,78.1460],
  ['Brindha Devi','brindha.d@yahoo.com','+91 98765 12345','36, Fairlands Main Road, Salem','Fairlands',11.6550,78.1500],
  ['Thirumalai Prasad','tprasad@outlook.com','+91 94430 23456','47, Hasthampatti Main Road, Salem','Hasthampatti',11.6700,78.1380],
  ['Pandiyan Selvan','pandiyanselvan@gmail.com','+91 98400 34567','24, Brough Road, Tiruchirappalli','Tiruchirappalli',10.7905,78.7047],
  ['Kamala Kannan','kamala.k@yahoo.com','+91 97890 45678','53, Thillai Nagar 10th Street, Trichy','Thillai Nagar',10.8050,78.6850],
  ['Senthil Nathan','senthil.n@gmail.com','+91 95000 56789','31, Srirangam Island Road, Trichy','Srirangam',10.8550,78.6950],
  ['Palaniappan Chettiar','palaniappan.c@rediffmail.com','+91 98765 67890','17, Perundurai Road, Erode','Erode',11.3410,77.7172],
  ['Thavamani Palani','thavamani.p@gmail.com','+91 94430 78901','42, Bypass Road, Erode','Erode',11.3350,77.7250],
  ['Chandrasekar Reddy','chandru.r@yahoo.com','+91 98400 89012','25, Katpadi Road, Vellore','Vellore',12.9165,79.1325],
  ['Revathi Srinivasan','revathi.s@gmail.com','+91 97890 90123','58, Sripuram Temple Road, Vellore','Sripuram',12.8800,79.1350],
  ['Chelladurai','chelladurai@gmail.com','+91 95000 01234','34, Palayamkottai Road, Tirunelveli','Tirunelveli',8.7139,77.7567],
  ['Thangam Raj','thangam.r@outlook.com','+91 98765 12345','61, Melapalayam Road, Tirunelveli','Melapalayam',8.7200,77.7480],
  ['Suresh Babu','suresh.babu@gmail.com','+91 94430 23456','13, Kanchipuram MGR Road, Kanchipuram','Kanchipuram',12.8342,79.7036],
  ['Saravanan Iyer','saravanan.i@yahoo.com','+91 98400 34567','46, Kamakshi Temple Road, Kanchipuram','Kanchipuram',12.8380,79.7000],
  ['Ramanujam Iyengar','ramanujam.i@rediffmail.com','+91 97890 45678','27, Mission Street, Pondicherry','Pondicherry',11.9416,79.8083],
  ['Jayashree Devi','jayashree.d@gmail.com','+91 95000 56789','59, NECC Street, Pondicherry','Pondicherry',11.9350,79.8100],
  ['Manikandan Vel','manikandan.v@gmail.com','+91 98765 67890','40, Chidambaram Road, Pondicherry','Pondicherry',11.9380,79.8050],
  ['Vijayalakshmi Devi','vijayalakshmi.d@outlook.com','+91 94430 78901','8, Gandhi Road, Mount Road, Chennai','Chennai Central',13.0827,80.2707],
  ['Narayanan Rajagopal','narayanan.r@yahoo.com','+91 98400 89012','71, Nungambakkam High Road, Chennai','Chennai Central',13.0600,80.2450],
  ['Nirmala Devi','nirmala.d@gmail.com','+91 97890 90123','3, Vepery High Road, Chennai','Chennai Central',13.0700,80.2500],
  ['Balaji Raman','balaji.r@rediffmail.com','+91 95000 01234','82, Purasawalkam High Road, Chennai','Chennai Central',13.0580,80.2520],
  ['Geetha Srinivasan','geetha.s@gmail.com','+91 98765 12345','19, Chetpet High Road, Chennai','Chetpet',13.0710,80.2430],
];

const citizens = citizenData.map((c, i) => ({
  id: uid('usr_cit', i + 1),
  name: c[0], email: c[1], password: HASH, phone: c[2],
  role: 'citizen', avatar: '', address: c[3], district: c[4],
  location: { lat: c[5], lng: c[6] },
  status: 'active', verified: true,
  createdAt: iso(150 - i * 3), updatedAt: iso(i),
}));

// ===== COMPLAINT DATA =====
const complaintDefs = [
  // --- SUBMITTED (1-8) ---
  { n: 1, reporter: 1, title: 'Deep pothole near T. Nagar bus depot', desc: 'A large pothole has formed right in front of the T. Nagar bus depot. Multiple buses and two-wheelers swerve daily to avoid it. Very dangerous during evening rush hour.', dist: 'T. Nagar', lat: 13.0420, lng: 80.2345, addr: 'Near T. Nagar Bus Depot, South Mada Street, T. Nagar', type: 'pothole', severity: 'high', status: 'submitted', priority: 'high' },
  { n: 2, reporter: 2, title: 'Cracked asphalt on Adyar Bridge Road', desc: 'Longitudinal cracks running along the center of Adyar Bridge Road. Rainwater seeps through and worsens the damage during monsoon. Multiple vehicles have reported tire damage.', dist: 'Adyar', lat: 13.0070, lng: 80.2570, addr: 'Adyar Bridge Road, near Indian Bank, Adyar', type: 'crack', severity: 'medium', status: 'submitted', priority: 'medium' },
  { n: 3, reporter: 3, title: 'Pothole cluster on Velachery Main Road', desc: 'Three interconnected potholes near the Velachery junction. During heavy rain, they fill with water and become invisible to drivers. A motorcyclist fell here last week.', dist: 'Velachery', lat: 12.9820, lng: 80.2185, addr: 'Velachery Main Road, near MRTS Station', type: 'pothole', severity: 'critical', status: 'submitted', priority: 'critical' },
  { n: 4, reporter: 4, title: 'Surface peeling on Anna Nagar 2nd Avenue', desc: 'The top layer of asphalt is peeling off in large patches on 2nd Avenue. Exposed aggregate underneath causes rough rides for two-wheelers.', dist: 'Anna Nagar', lat: 13.0855, lng: 80.2110, addr: '2nd Avenue, Anna Nagar', type: 'surface_damage', severity: 'medium', status: 'submitted', priority: 'medium' },
  { n: 5, reporter: 21, title: 'Large sinkhole near Gandhipuram signal', desc: 'A sinkhole has opened up near the Gandhipuram traffic signal. It is approximately 2 feet wide and deep. Vehicles are unable to use the left lane.', dist: 'Gandhipuram', lat: 11.0175, lng: 76.9565, addr: 'Gandhipuram 4th Signal, Coimbatore', type: 'sinkhole', severity: 'critical', status: 'submitted', priority: 'critical' },
  { n: 6, reporter: 25, title: 'Deep rutting on KK Nagar 6th Street', desc: 'Severe rutting along the wheel path on KK Nagar 6th Street. Buses leaving deep grooves in the road surface. Bikes struggle to maintain balance.', dist: 'KK Nagar', lat: 9.9465, lng: 78.1225, addr: '6th Street, KK Nagar, Madurai', type: 'rutting', severity: 'high', status: 'submitted', priority: 'high' },
  { n: 7, reporter: 39, title: 'Edge damage on Palayamkottai Road divider', desc: 'Road edge has broken away near the divider on Palayamkottai Road. Exposed rebar visible. Pedestrians and two-wheelers at risk.', dist: 'Tirunelveli', lat: 8.7145, lng: 77.7575, addr: 'Palayamkottai Road, near Controller Office', type: 'edge_damage', severity: 'high', status: 'submitted', priority: 'high' },
  { n: 8, reporter: 38, title: 'Depression in road near Sripuram junction', desc: 'A noticeable depression has formed near the Sripuram junction. Water pools here after rain creating a hidden hazard for vehicles approaching from the temple road.', dist: 'Sripuram', lat: 12.8810, lng: 79.1355, addr: 'Sripuram Junction, near Golden Temple Road, Vellore', type: 'depression', severity: 'medium', status: 'submitted', priority: 'medium' },

  // --- UNDER REVIEW (9-14) ---
  { n: 9, reporter: 32, title: 'Pothole at Brough Road junction, Trichy', desc: 'A deep pothole has appeared right at the Brough Road junction. Vehicles braking at the signal hit this pothole regularly causing underbody damage.', dist: 'Tiruchirappalli', lat: 10.7910, lng: 78.7055, addr: 'Brough Road Junction, Tiruchirappalli', type: 'pothole', severity: 'high', status: 'under_review', priority: 'high' },
  { n: 10, reporter: 29, title: 'Crack lines across Attur Road, Salem', desc: 'Multiple transverse cracks have appeared across the full width of Attur Road near the bus stand. The cracks have widened over the past month.', dist: 'Salem', lat: 11.6650, lng: 78.1470, addr: 'Attur Road, near Salem Bus Stand', type: 'crack', severity: 'medium', status: 'under_review', priority: 'medium' },
  { n: 11, reporter: 35, title: 'Pothole after Perundurai flyover, Erode', desc: 'Immediately after the Perundurai flyover there is a deep pothole that catches vehicles coming down at speed. Several complaints from auto drivers.', dist: 'Erode', lat: 11.3420, lng: 77.7180, addr: 'Perundurai Road, after flyover, Erode', type: 'pothole', severity: 'high', status: 'under_review', priority: 'high' },
  { n: 12, reporter: 37, title: 'Broken surface near Katpadi Road junction', desc: 'The road surface near the Katpadi Road junction has broken apart into loose chunks. Heavy vehicles passing through have worsened the condition.', dist: 'Vellore', lat: 12.9170, lng: 79.1330, addr: 'Katpadi Road Junction, Vellore', type: 'surface_damage', severity: 'medium', status: 'under_review', priority: 'medium' },
  { n: 13, reporter: 22, title: 'Crack and water ingress on Peelamedu flyover ramp', desc: 'A diagonal crack has formed on the Peelamedu flyover ramp. Rainwater is seeping through and weakening the underlying layer. Structural inspection recommended.', dist: 'Peelamedu', lat: 11.0310, lng: 76.9910, addr: 'Peelamedu Flyover Ramp, Avinashi Road, Coimbatore', type: 'crack', severity: 'critical', status: 'under_review', priority: 'critical' },
  { n: 14, reporter: 40, title: 'Depression near Melapalayam canal bridge', desc: 'A significant depression has formed near the canal bridge in Melapalayam. Vehicles dip sharply when crossing this section.', dist: 'Melapalayam', lat: 8.7210, lng: 77.7490, addr: 'Melapalayam Canal Bridge, Tirunelveli', type: 'depression', severity: 'high', status: 'under_review', priority: 'high' },

  // --- VERIFIED (15-20) ---
  { n: 15, reporter: 33, title: 'Pothole at Thillai Nagar 10th Street crossing', desc: 'A pothole right at the street crossing in Thillai Nagar. School buses pass through this route daily and children are at risk.', dist: 'Thillai Nagar', lat: 10.8060, lng: 78.6860, addr: '10th Street Crossing, Thillai Nagar, Trichy', type: 'pothole', severity: 'high', status: 'verified', priority: 'high' },
  { n: 16, reporter: 23, title: 'Rutting on RS Puram 4th Street', desc: 'Heavy rutting along the center of RS Puram 4th Street. The wheel path has become a trench nearly 3 inches deep. Cars scrape their underbody.', dist: 'RS Puram', lat: 11.0060, lng: 76.9540, addr: '4th Street, RS Puram, Coimbatore', type: 'rutting', severity: 'high', status: 'verified', priority: 'high' },
  { n: 17, reporter: 26, title: 'Pothole near Alagar Koil Road junction, Madurai', desc: 'A deep pothole near the Alagar Koil Road junction has been growing for the past month. Two auto-rickshaws reported tire punctures here.', dist: 'Madurai Central', lat: 9.9290, lng: 78.1190, addr: 'Alagar Koil Road Junction, Madurai', type: 'pothole', severity: 'high', status: 'verified', priority: 'high' },
  { n: 18, reporter: 30, title: 'Surface damage on Fairlands Main Road', desc: 'Large sections of the road surface have disintegrated on Fairlands Main Road. Exposed gravel and loose stones make this stretch hazardous.', dist: 'Fairlands', lat: 11.6560, lng: 78.1510, addr: 'Fairlands Main Road, Salem', type: 'surface_damage', severity: 'medium', status: 'verified', priority: 'medium' },
  { n: 19, reporter: 47, title: 'Pothole on Nungambakkam High Road', desc: 'A wide pothole near the Nungambakkam High Road intersection. Traffic builds up as vehicles slow down to navigate around it during peak hours.', dist: 'Chennai Central', lat: 13.0610, lng: 80.2460, addr: 'Nungambakkam High Road, near Gemini Flyover', type: 'pothole', severity: 'medium', status: 'verified', priority: 'medium' },
  { n: 20, reporter: 42, title: 'Edge breakage near Kamakshi Temple Road', desc: 'The road edge along Kamakshi Temple Road has collapsed in two places. Pedestrians are forced to walk on the carriageway.', dist: 'Kanchipuram', lat: 12.8390, lng: 79.7010, addr: 'Kamakshi Temple Road, Kanchipuram', type: 'edge_damage', severity: 'medium', status: 'verified', priority: 'medium' },

  // --- ASSIGNED (21-28) ---
  { n: 21, reporter: 43, title: 'Pothole at Mission Street crossing, Pondicherry', desc: 'A deep pothole right at the Mission Street crossing. Tourists and locals navigate this area daily. Several near-misses reported.', dist: 'Pondicherry', lat: 11.9420, lng: 79.8090, addr: 'Mission Street Crossing, Pondicherry', type: 'pothole', severity: 'high', status: 'assigned', priority: 'high', contractor: 'usr_ctr_010' },
  { n: 22, reporter: 48, title: 'Crack pattern on Vepery High Road', desc: 'Alligator cracking pattern has developed across the full width of Vepery High Road near the hospital. Surface is crumbling and loose aggregate scattered.', dist: 'Chennai Central', lat: 13.0710, lng: 80.2510, addr: 'Vepery High Road, near Vepery Hospital', type: 'crack', severity: 'medium', status: 'assigned', priority: 'medium', contractor: 'usr_ctr_001' },
  { n: 23, reporter: 6, title: 'Deep pothole near Sholinganallur IT corridor', desc: 'A dangerous pothole near the Sholinganallur IT corridor on the service road. IT employees commuting on two-wheelers face high risk.', dist: 'Sholinganallur', lat: 12.9020, lng: 80.2270, addr: 'Sholinganallur IT Expressway, Service Road', type: 'pothole', severity: 'critical', status: 'assigned', priority: 'critical', contractor: 'usr_ctr_002' },
  { n: 24, reporter: 33, title: 'Pothole near Thillai Nagar main road, Trichy', desc: 'A cluster of potholes near Thillai Nagar main road entrance. Water stagnation after rain hides the depth. Multiple two-wheeler incidents reported.', dist: 'Thillai Nagar', lat: 10.8040, lng: 78.6870, addr: 'Thillai Nagar Main Road, Tiruchirappalli', type: 'pothole', severity: 'high', status: 'assigned', priority: 'high', contractor: 'usr_ctr_007' },
  { n: 25, reporter: 27, title: 'Pothole at Pasumalai Hill Road bend', desc: 'A deep pothole at the bend of Pasumalai Hill Road. Vehicles coming downhill from the university campus hit this at speed.', dist: 'Pasumalai', lat: 9.9190, lng: 78.1310, addr: 'Pasumalai Hill Road Bend, Madurai', type: 'pothole', severity: 'critical', status: 'assigned', priority: 'critical', contractor: 'usr_ctr_006' },
  { n: 26, reporter: 31, title: 'Crack on Hasthampatti Main Road', desc: 'A longitudinal crack running 15 meters along Hasthampatti Main Road. Monsoon water is widening the crack week by week.', dist: 'Hasthampatti', lat: 11.6710, lng: 78.1390, addr: 'Hasthampatti Main Road, near bus stop, Salem', type: 'crack', severity: 'medium', status: 'assigned', priority: 'medium', contractor: 'usr_ctr_008' },
  { n: 27, reporter: 36, title: 'Depression near Perundurai Road bridge, Erode', desc: 'A depression has formed in the approach to the Perundurai Road bridge. Vehicles dip sharply here causing multiple tire blowouts this month.', dist: 'Erode', lat: 11.3380, lng: 77.7200, addr: 'Perundurai Road Bridge Approach, Erode', type: 'depression', severity: 'high', status: 'assigned', priority: 'high', contractor: 'usr_ctr_005' },
  { n: 28, reporter: 24, title: 'Pothole on Singanallur OS Road', desc: 'A wide pothole on Singanallur OS Road near the railway crossing. Heavy traffic from buses and trucks has made this a recurring problem.', dist: 'Singanallur', lat: 11.0130, lng: 77.0110, addr: 'Singanallur OS Road, near Railway Crossing, Coimbatore', type: 'pothole', severity: 'high', status: 'assigned', priority: 'high', contractor: 'usr_ctr_005' },

  // --- IN PROGRESS (29-36) ---
  { n: 29, reporter: 28, title: 'Pothole near Thiruppalai Main Road junction', desc: 'A deep pothole at the Thiruppalai junction. Heavy vehicle traffic from the nearby market area has severely damaged this section.', dist: 'Thiruppalai', lat: 9.9610, lng: 78.1410, addr: 'Thiruppalai Main Road Junction, Madurai', type: 'pothole', severity: 'high', status: 'in_progress', priority: 'high', contractor: 'usr_ctr_006', notes: 'Excavation complete, base layer being prepared' },
  { n: 30, reporter: 49, title: 'Crack pattern on Purasawalkam High Road', desc: 'Extensive alligator cracking on Purasawalkam High Road near the store. The surface is about to give way.', dist: 'Chennai Central', lat: 13.0590, lng: 80.2530, addr: 'Purasawalkam High Road, near Surya Store', type: 'crack', severity: 'critical', status: 'in_progress', priority: 'critical', contractor: 'usr_ctr_002', notes: 'Milling done, fresh asphalt being laid' },
  { n: 31, reporter: 17, title: 'Rutting on Chromepet Radial Road', desc: 'Severe rutting along the bus lane on Chromepet Radial Road. The grooves are deep enough to trap bicycle wheels.', dist: 'Chromepet', lat: 12.9520, lng: 80.1400, addr: 'Chromepet Radial Road, near Bus Stand', type: 'rutting', severity: 'high', status: 'in_progress', priority: 'high', contractor: 'usr_ctr_001', notes: 'Old surface removed, leveling course being applied' },
  { n: 32, reporter: 8, title: 'Pothole cluster on Tambaram Sanatorium Road', desc: 'Multiple potholes have appeared on Tambaram Sanatorium Road after the recent monsoon. Barely passable for two-wheelers.', dist: 'Tambaram', lat: 12.9255, lng: 80.1010, addr: 'Tambaram Sanatorium Road, near Railway Station', type: 'pothole', severity: 'critical', status: 'in_progress', priority: 'critical', contractor: 'usr_ctr_009', notes: 'Deep excavation completed, filling with new aggregate' },
  { n: 33, reporter: 34, title: 'Pothole at Srirangam Island Road entrance', desc: 'A dangerous pothole at the entrance to Srirangam Island Road. Devotees heading to the temple and tourist vehicles pass through here.', dist: 'Srirangam', lat: 10.8560, lng: 78.6960, addr: 'Srirangam Island Road Entrance, Tiruchirappalli', type: 'pothole', severity: 'high', status: 'in_progress', priority: 'high', contractor: 'usr_ctr_007', notes: 'Base repair done, surface layer being compacted' },
  { n: 34, reporter: 50, title: 'Surface damage on Chetpet High Road', desc: 'The road surface on Chetpet High Road has deteriorated significantly near the park. Loose gravel and uneven patches.', dist: 'Chetpet', lat: 13.0720, lng: 80.2440, addr: 'Chetpet High Road, near Chetpet Lake', type: 'surface_damage', severity: 'medium', status: 'in_progress', priority: 'medium', contractor: 'usr_ctr_003', notes: 'Surface milling in progress, resurfacing expected within 2 days' },
  { n: 35, reporter: 41, title: 'Deep pothole near Kanchipuram MGR Road', desc: 'A deep pothole near the Kanchipuram MGR Road junction. Heavy vehicles passing through on the way to the highway have worsened the damage.', dist: 'Kanchipuram', lat: 12.8350, lng: 79.7040, addr: 'Kanchipuram MGR Road Junction', type: 'pothole', severity: 'high', status: 'in_progress', priority: 'high', contractor: 'usr_ctr_009', notes: 'Excavation and debris removal complete, hot mix being prepared' },
  { n: 36, reporter: 47, title: 'Pothole near Nungambakkam railway crossing', desc: 'Pothole that forms every monsoon near the Nungambakkam railway crossing. Last year patch job has already failed.', dist: 'Chennai Central', lat: 13.0595, lng: 80.2475, addr: 'Nungambakkam Railway Crossing', type: 'pothole', severity: 'medium', status: 'in_progress', priority: 'medium', contractor: 'usr_ctr_001', notes: 'Old patch removed, excavation to sub-base level in progress' },

  // --- COMPLETED (37-54) ---
  { n: 37, reporter: 36, title: 'Pothole at Bypass Road signal, Erode', desc: 'A pothole right at the Bypass Road traffic signal in Erode. Vehicles stopping at the signal hit this while accelerating.', dist: 'Erode', lat: 11.3360, lng: 77.7260, addr: 'Bypass Road Signal, Erode', type: 'pothole', severity: 'high', status: 'completed', priority: 'high', contractor: 'usr_ctr_005', repairType: 'full-depth-repair', compNotes: 'Full-depth patching completed. Area excavated to 200mm, aggregate base laid, hot mix asphalt compacted.', duration: 55, rating: 5, comment: 'Excellent work by the team. Road is smooth and the repair looks very professional. Thank you!' },
  { n: 38, reporter: 37, title: 'Crack on Katpadi Road near bus depot', desc: 'A long transverse crack on Katpadi Road near the Vellore bus depot. Heavy buses passing daily have widened the crack.', dist: 'Vellore', lat: 12.9180, lng: 79.1340, addr: 'Katpadi Road, near Vellore Bus Depot', type: 'crack', severity: 'medium', status: 'completed', priority: 'medium', contractor: 'usr_ctr_002', repairType: 'surface-treatment', compNotes: 'Crack sealed with hot pour sealant. Surface resealed with tack coat.', duration: 57, rating: 4, comment: 'Good repair quality. The crack is fully sealed now.' },
  { n: 39, reporter: 4, title: 'Pothole on 2nd Avenue, Anna Nagar', desc: 'A pothole has formed near the Anna Nagar 2nd Avenue park entrance. Children walking to the nearby school are at risk.', dist: 'Anna Nagar', lat: 13.0860, lng: 80.2105, addr: '2nd Avenue, near Park Entrance, Anna Nagar', type: 'pothole', severity: 'critical', status: 'completed', priority: 'critical', contractor: 'usr_ctr_009', repairType: 'full-depth-repair', compNotes: 'Emergency repair completed. Deep excavation done, new sub-base and surface course laid.', duration: 52, rating: 5, comment: 'Very impressed with the speed of response. Road is perfectly smooth now.' },
  { n: 40, reporter: 25, title: 'Depression near KK Nagar main road', desc: 'A large depression on KK Nagar main road near the water tank. During monsoon this becomes a small lake blocking pedestrian access.', dist: 'KK Nagar', lat: 9.9470, lng: 78.1230, addr: 'KK Nagar Main Road, near Water Tank, Madurai', type: 'depression', severity: 'high', status: 'completed', priority: 'high', contractor: 'usr_ctr_006', repairType: 'full-depth-repair', compNotes: 'Full-depth repair done. Removed damaged sub-grade, added new aggregate, compacted and paved.', duration: 80, rating: 4, comment: 'Work done well. The depression is completely gone. Slightly delayed due to rain but satisfied.' },
  { n: 41, reporter: 15, title: 'Pothole on Ashok Nagar 100 Feet Road', desc: 'A deep pothole on the busy 100 Feet Road in Ashok Nagar. Vehicles swerving to avoid it are causing traffic jams.', dist: 'Ashok Nagar', lat: 13.0495, lng: 80.2155, addr: '100 Feet Road, Ashok Nagar', type: 'pothole', severity: 'high', status: 'completed', priority: 'high', contractor: 'usr_ctr_001', repairType: 'asphalt-patching', compNotes: 'Asphalt patching completed. Old material removed, new hot mix laid and compacted.', duration: 57, rating: 5, comment: 'The new surface is much better than before. Excellent work!' },
  { n: 42, reporter: 21, title: 'Edge damage near Gandhipuram bus stand', desc: 'The road edge near Gandhipuram bus stand has broken away leaving a 1-foot drop. Buses parking here risk tire damage.', dist: 'Gandhipuram', lat: 11.0180, lng: 76.9570, addr: 'Near Gandhipuram Bus Stand, Coimbatore', type: 'edge_damage', severity: 'high', status: 'completed', priority: 'high', contractor: 'usr_ctr_005', repairType: 'full-depth-repair', compNotes: 'Edge repaired with new concrete curb and asphalt overlay. Bus bay area reinforced.', duration: 72, rating: 4, comment: 'Good repair quality. The edge is secure now.' },
  { n: 43, reporter: 39, title: 'Rutting near Palayamkottai Road, Tirunelveli', desc: 'Severe rutting along the Palayamkottai Road near the court complex. Heavy vehicle traffic has created deep wheel tracks.', dist: 'Tirunelveli', lat: 8.7150, lng: 77.7580, addr: 'Palayamkottai Road, near Court Complex, Tirunelveli', type: 'rutting', severity: 'high', status: 'completed', priority: 'high', contractor: 'usr_ctr_004', repairType: 'full-depth-repair', compNotes: 'Surface milled and full-depth patching completed. New asphalt overlay applied.', duration: 72, rating: 5, comment: 'Excellent work! Road surface is now smooth and level.' },
  { n: 44, reporter: 11, title: 'Pothole on South Mada Street, T. Nagar', desc: 'A pothole right in the middle of the busy South Mada Street in T. Nagar. Thousands of pedestrians and vehicles daily.', dist: 'T. Nagar', lat: 13.0425, lng: 80.2350, addr: 'South Mada Street, T. Nagar, Chennai', type: 'pothole', severity: 'critical', status: 'completed', priority: 'critical', contractor: 'usr_ctr_002', repairType: 'full-depth-repair', compNotes: 'Emergency repair executed. Full-depth excavation and relaying completed during off-peak hours.', duration: 52, rating: 5, comment: 'Amazing speed! Repair done overnight with minimal disruption.' },
  { n: 45, reporter: 13, title: 'Surface damage on Velachery Tambaram Main Road', desc: 'Widespread surface damage on the Velachery Tambaram Main Road. Multiple patches of loose aggregate forming.', dist: 'Velachery', lat: 12.9835, lng: 80.2160, addr: 'Velachery Tambaram Main Road', type: 'surface_damage', severity: 'high', status: 'completed', priority: 'high', contractor: 'usr_ctr_003', repairType: 'surface-treatment', compNotes: 'Full-width resurfacing completed. Old surface milled, new DBM layer laid and rolled.', duration: 81, rating: 4, comment: 'Road looks great now. Smooth ride all the way.' },
  { n: 46, reporter: 10, title: 'Pothole near Thiruvanmiyur Beach Road', desc: 'A large pothole near the Thiruvanmiyur Beach Road entrance. Weekend traffic to the beach makes this a high-risk spot.', dist: 'Thiruvanmiyur', lat: 12.9840, lng: 80.2640, addr: 'Thiruvanmiyur Beach Road Entrance', type: 'pothole', severity: 'high', status: 'completed', priority: 'high', contractor: 'usr_ctr_001', repairType: 'asphalt-patching', compNotes: 'Asphalt patching completed. Excavation, new aggregate base and hot mix applied.', duration: 57, rating: 5, comment: 'Very impressed with the speed. Weekend beach traffic is smooth now.' },
  { n: 47, reporter: 19, title: 'Pothole near Kodambakkam Salai junction', desc: 'A deep pothole right at the Kodambakkam Salai junction. Heavy traffic throughout the day. Two-wheeler riders at risk.', dist: 'Kodambakkam', lat: 13.0535, lng: 80.2245, addr: 'Kodambakkam Salai Junction', type: 'pothole', severity: 'high', status: 'completed', priority: 'high', contractor: 'usr_ctr_002', repairType: 'full-depth-repair', compNotes: 'Full-depth patching done. Junction area reinforced.', duration: 72, rating: 3, comment: 'Work done but the patch is slightly uneven. Acceptable overall.' },
  { n: 48, reporter: 43, title: 'Crack on Mission Street near church, Pondicherry', desc: 'A deep crack running across Mission Street near the old church. Heritage area affected, tourist foot traffic impacted.', dist: 'Pondicherry', lat: 11.9430, lng: 79.8095, addr: 'Mission Street, near Old Church, Pondicherry', type: 'crack', severity: 'medium', status: 'completed', priority: 'medium', contractor: 'usr_ctr_010', repairType: 'surface-treatment', compNotes: 'Crack sealed and surface overlay applied. Heritage zone required careful texture matching.', duration: 57, rating: 4, comment: 'Good repair quality. Tourists can walk safely now.' },
  { n: 49, reporter: 12, title: 'Pothole at Adyar Bridge approach road', desc: 'Pothole at the approach to Adyar Bridge. Constant heavy traffic from IT corridor commuters has damaged this stretch.', dist: 'Adyar', lat: 13.0075, lng: 80.2580, addr: 'Adyar Bridge Approach Road', type: 'pothole', severity: 'high', status: 'completed', priority: 'high', contractor: 'usr_ctr_002', repairType: 'full-depth-repair', compNotes: 'Full-depth patching done. Deep excavation to remove weak subgrade. Drainage improved.', duration: 72, rating: 5, comment: 'Daily commute to IT park is much better now. Thank you!' },
  { n: 50, reporter: 26, title: 'Pothole near Alagar Koil Road, Madurai', desc: 'A recurring pothole near Alagar Koil Road that gets patched every monsoon but reappears. Needs full-depth reconstruction.', dist: 'Madurai Central', lat: 9.9295, lng: 78.1195, addr: 'Alagar Koil Road, near Meenakshi Temple bypass', type: 'pothole', severity: 'high', status: 'completed', priority: 'high', contractor: 'usr_ctr_006', repairType: 'full-depth-repair', compNotes: 'Full-depth reconstruction done. Excavated to 300mm, new sub-base and surface course installed.', duration: 96, rating: 5, comment: 'Excellent work! This time the repair looks solid.' },
  { n: 51, reporter: 48, title: 'Deep pothole on Vepery High Road', desc: 'A deep pothole has formed on Vepery High Road near the shopping area. Vehicles slow down abruptly causing fender benders.', dist: 'Chennai Central', lat: 13.0720, lng: 80.2520, addr: 'Vepery High Road, near Parekh Street', type: 'pothole', severity: 'high', status: 'completed', priority: 'high', contractor: 'usr_ctr_001', repairType: 'asphalt-patching', compNotes: 'Asphalt patching completed. New hot mix laid and compacted.', duration: 72, rating: 4, comment: 'Satisfied with the result. The pothole is gone and road is safe.' },
  { n: 52, reporter: 46, title: 'Pothole on Chennai Central railway station road', desc: 'Large pothole on the road leading to Chennai Central railway station. Thousands of passengers daily.', dist: 'Chennai Central', lat: 13.0830, lng: 80.2710, addr: 'Road near Chennai Central Railway Station', type: 'pothole', severity: 'critical', status: 'completed', priority: 'critical', contractor: 'usr_ctr_009', repairType: 'full-depth-repair', compNotes: 'Emergency repair done overnight. Deep excavation, new base and surface course laid.', duration: 52, rating: 5, comment: 'Amazing speed! Repair done overnight with minimal disruption.' },
  { n: 53, reporter: 6, title: 'Pothole at Sholinganallur Navalur Road', desc: 'Multiple potholes forming along Navalur road in Sholinganallur. IT professionals commuting daily face risk.', dist: 'Sholinganallur', lat: 12.9040, lng: 80.2265, addr: 'Navalur Road, Sholinganallur', type: 'pothole', severity: 'high', status: 'completed', priority: 'high', contractor: 'usr_ctr_002', repairType: 'asphalt-patching', compNotes: 'Cluster of potholes repaired. Each excavated individually, hot mix surface course compacted.', duration: 96, rating: 4, comment: 'Good repair quality. All potholes filled. Worth the wait.' },
  { n: 54, reporter: 17, title: 'Crack on Chromepet main road', desc: 'A longitudinal crack running along the center line of Chromepet main road near the railway station.', dist: 'Chromepet', lat: 12.9530, lng: 80.1420, addr: 'Chromepet Main Road, near Railway Station', type: 'crack', severity: 'medium', status: 'completed', priority: 'medium', contractor: 'usr_ctr_003', repairType: 'surface-treatment', compNotes: 'Crack sealing and surface overlay completed. Hot pour sealant applied along full crack length.', duration: 57, rating: 4, comment: 'Good repair. Crack is properly sealed. Should last through monsoon.' },

  // --- REJECTED (55-60) ---
  { n: 55, reporter: 29, title: 'Pothole on Tirumalai Nagar main road, Salem', desc: 'A pothole on Tirumalai Nagar main road near the vegetable market. Heavy auto and truck traffic.', dist: 'Salem', lat: 11.6655, lng: 78.1475, addr: 'Tirumalai Nagar Main Road, near Market, Salem', type: 'pothole', severity: 'high', status: 'completed', priority: 'high', contractor: 'usr_ctr_008', repairType: 'full-depth-repair', compNotes: 'Full-depth patching completed. New base course and surface course laid.', duration: 72, rating: 5, comment: 'Excellent work! Road is perfectly smooth now.' },
  { n: 56, reporter: 26, title: 'Same pothole reported again (duplicate)', desc: 'Reporting the same pothole on Alagar Koil Road that was already repaired. Appears the patch has started to crack again.', dist: 'Madurai Central', lat: 9.9298, lng: 78.1198, addr: 'Alagar Koil Road, Madurai', type: 'pothole', severity: 'medium', status: 'rejected', priority: 'low', rejectReason: 'Duplicate complaint. This location was already repaired under TNR-2050. If the patch has cracked, please submit a new complaint with fresh images.', dupeOf: 50 },
  { n: 57, reporter: 39, title: 'Reported damage already under municipal project', desc: 'A section of Palayamkottai Road is heavily damaged. Multiple vehicles have been damaged.', dist: 'Tirunelveli', lat: 8.7155, lng: 77.7585, addr: 'Palayamkottai Road Extension, Tirunelveli', type: 'surface_damage', severity: 'medium', status: 'rejected', priority: 'low', rejectReason: 'This section is already scheduled for full reconstruction under the TN State Highways project beginning next month.' },
  { n: 58, reporter: 44, title: 'Insufficient evidence for verification', desc: 'There is a bad road near the temple. Please fix it.', dist: 'Pondicherry', lat: 11.9440, lng: 79.8100, addr: 'Near Manakula Vinayagar Temple, Pondicherry', type: 'other', severity: 'low', status: 'rejected', priority: 'low', rejectReason: 'Complaint lacks sufficient detail. No images attached, description does not match detectable road damage. Please resubmit with a photo and exact location.' },
  { n: 59, reporter: 46, title: 'Pothole on road - no location specified', desc: 'Please fix the pothole on the road near my house. It is very bad and needs repair urgently.', dist: 'Chennai Central', lat: 13.0835, lng: 80.2715, addr: 'Unspecified location, Chennai', type: 'pothole', severity: 'low', status: 'rejected', priority: 'low', rejectReason: 'Cannot identify the complaint location. No identifiable landmark or address provided. Please resubmit with the exact road name and location.' },
  { n: 60, reporter: 45, title: 'Crack on private property road', desc: 'There is a crack on the road inside our apartment complex. The builder should fix this.', dist: 'Pondicherry', lat: 11.9385, lng: 79.8055, addr: 'Private Apartment Complex Road, Pondicherry', type: 'crack', severity: 'low', status: 'rejected', priority: 'low', rejectReason: 'This is a road on private property maintained by the apartment association. Municipal jurisdiction does not apply. Please contact your association.' },
];

const allComplaints = [];
const adminId = 'usr_adm_001';

complaintDefs.forEach((c, idx) => {
  const reportNum = 'TNR-' + String(2000 + c.n).padStart(4, '0');
  const createdDaysAgo = 90 - idx * 1.2;
  const created = iso(createdDaysAgo);

  const complaint = {
    _n: c.n,
    _reporterIdx: c.reporter,
    id: uid('cmp', c.n),
    reportNumber: reportNum,
    title: c.title,
    description: c.desc,
    images: [],
    location: { lat: c.lat, lng: c.lng },
    address: c.addr,
    district: c.dist,
    type: c.type,
    status: c.status,
    priority: c.priority,
    reporter: uid('usr_cit', c.reporter),
    aiAnalysis: {
      detected: c.type,
      severity: c.severity,
      confidence: 88 + ((c.n * 7) % 11),
      recommendation: c.severity === 'critical' ? 'Urgent intervention required. Isolate area with signage and repair within 24 hours.' :
        c.severity === 'high' ? 'Immediate repair required. Potential risk to vehicles and two-wheelers.' :
        c.severity === 'medium' ? 'Plan repair within the next 2 weeks. Monitor drainage to prevent expansion.' :
        'Schedule routine inspection. Low-priority patching recommended within 30 days.',
      isRoadImage: c.severity !== 'low' || c.status !== 'rejected',
      tags: [c.type.replace(/_/g, ' '), c.severity === 'critical' ? 'hazard' : c.severity === 'high' ? 'high-risk' : 'maintenance', c.n % 3 === 0 ? 'water-damage' : 'wear-and-tear'],
      model: 'yolov8s-rdd2022-v1',
      analyzedAt: iso(createdDaysAgo - 0.1),
    },
    timestamps: { created, updated: iso(createdDaysAgo - 0.5) },
  };

  if (c.status === 'under_review') {
    complaint.timestamps.updated = iso(createdDaysAgo - 0.5);
  }

  if (c.status === 'verified') {
    complaint.verifiedBy = adminId;
    complaint.verifiedAt = iso(createdDaysAgo - 0.5);
    complaint.timestamps.updated = iso(createdDaysAgo - 0.5);
  }

  if (c.status === 'assigned') {
    complaint.verifiedBy = adminId;
    complaint.verifiedAt = iso(createdDaysAgo - 0.5);
    complaint.assignedContractor = c.contractor;
    complaint.assignedAt = iso(createdDaysAgo - 1);
    complaint.timestamps.updated = iso(createdDaysAgo - 1);
  }

  if (c.status === 'in_progress') {
    complaint.verifiedBy = adminId;
    complaint.verifiedAt = iso(createdDaysAgo - 0.5);
    complaint.assignedContractor = c.contractor;
    complaint.assignedAt = iso(createdDaysAgo - 1);
    complaint.startedAt = iso(createdDaysAgo - 1.5);
    complaint.completion = {
      beforeImages: [], afterImages: [],
      notes: c.notes,
      completedBy: c.contractor,
    };
    complaint.timestamps.updated = iso(createdDaysAgo - 1.5);
  }

  if (c.status === 'completed') {
    complaint.verifiedBy = adminId;
    complaint.verifiedAt = iso(createdDaysAgo - 0.5);
    complaint.assignedContractor = c.contractor;
    complaint.assignedAt = iso(createdDaysAgo - 1);
    complaint.startedAt = iso(createdDaysAgo - 1.5);
    const completedAt = iso(createdDaysAgo - 3);
    complaint.completedAt = completedAt;
    complaint.completion = {
      beforeImages: [], afterImages: [],
      notes: c.compNotes,
      repairType: c.repairType,
      completedBy: c.contractor,
      completedAt,
      durationHours: c.duration,
    };
    complaint.feedback = { rating: c.rating, comment: c.comment, createdAt: iso(createdDaysAgo - 3.5) };
    complaint.timestamps.updated = completedAt;
  }

  if (c.status === 'rejected') {
    complaint.rejectedReason = c.rejectReason;
    if (c.dupeOf) complaint.duplicateOf = uid('cmp', c.dupeOf);
    complaint.timestamps.updated = iso(createdDaysAgo - 0.3);
  }

  allComplaints.push(complaint);
});

// ===== NOTIFICATIONS =====
const notifications = [];

// Admin notifications
[
  { title: 'New complaint submitted', message: '3 new complaints await verification today.', link: '/admin/complaints', daysAgo: 2, type: 'complaint' },
  { title: 'Weekly report ready', message: 'Your weekly road-damage analytics report is ready to download.', link: '/admin/analytics', daysAgo: 0, type: 'info' },
  { title: 'New citizen feedback', message: 'A citizen rated the completed repair 5/5.', link: '/admin/reports', daysAgo: 1, type: 'feedback' },
  { title: 'Critical complaint alert', message: 'Sinkhole reported near Gandhipuram signal requires urgent attention.', link: '/admin/complaints', daysAgo: 3, type: 'complaint' },
].forEach(n => {
  notifications.push({
    id: uid('ntf', notifications.length + 1),
    user: adminId, type: n.type, title: n.title, message: n.message, link: n.link,
    read: n.daysAgo > 2, createdAt: iso(n.daysAgo),
  });
});

// Citizen notifications
[1,2,3,4,5,10,11,12,15,21,25,26,28,32,35,39,40,41,43,44,46,47,48,49,50,52,53].forEach((cn, i) => {
  const c = allComplaints.find(x => x._n === cn);
  if (!c) return;
  const citizenId = uid('usr_cit', c._reporterIdx);
  const msgs = [];
  if (c.status !== 'rejected') {
    msgs.push({ type: 'complaint', title: 'Complaint registered', message: `Your complaint ${c.reportNumber} has been registered and is under AI review.`, link: `/complaints/${c.reportNumber}`, daysAgo: Math.round(90 - i * 1.2) });
    msgs.push({ type: 'ai', title: 'AI analysis complete', message: `AI detected a ${c.severity} severity ${c.type.replace(/_/g, ' ')} with ${88 + ((c._n * 7) % 11)}% confidence in ${c.reportNumber}.`, link: `/complaints/${c.reportNumber}`, daysAgo: Math.round(90 - i * 1.2 - 1) });
  }
  if (['verified','assigned','in_progress','completed'].includes(c.status)) {
    msgs.push({ type: 'complaint', title: 'Complaint verified', message: `${c.reportNumber} was verified by the municipality and marked for repair.`, link: `/complaints/${c.reportNumber}`, daysAgo: Math.round(88 - i * 1.2) });
  }
  if (['assigned','in_progress','completed'].includes(c.status) && c.contractor) {
    const ctr = contractors.find(x => x.id === c.contractor);
    msgs.push({ type: 'assignment', title: 'Contractor assigned', message: `${ctr ? ctr.name : 'Contractor'} has been assigned to repair ${c.reportNumber}.`, link: `/complaints/${c.reportNumber}`, daysAgo: Math.round(87 - i * 1.2) });
  }
  if (c.status === 'completed') {
    msgs.push({ type: 'completion', title: 'Repair completed', message: `The ${c.type.replace(/_/g, ' ')} in ${c.reportNumber} has been repaired. Please share your feedback.`, link: `/complaints/${c.reportNumber}`, daysAgo: Math.round(84 - i * 1.2) });
  }
  msgs.forEach(m => {
    notifications.push({
      id: uid('ntf', notifications.length + 1),
      user: citizenId, type: m.type, title: m.title, message: m.message, link: m.link,
      read: m.daysAgo > 20, createdAt: iso(m.daysAgo),
    });
  });
});

// Contractor notifications
[21,23,24,25,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55].forEach((cn, i) => {
  const c = allComplaints.find(x => x._n === cn);
  if (!c || !c.contractor) return;
  const msgs = [];
  if (['assigned','in_progress','completed'].includes(c.status)) {
    msgs.push({ type: 'assignment', title: 'New work assignment', message: `${c.reportNumber} assigned to your team. Estimated 2 day repair window.`, link: `/contractor/jobs/${c.reportNumber}`, daysAgo: Math.round(87 - i * 1.5) });
  }
  if (['in_progress','completed'].includes(c.status)) {
    msgs.push({ type: 'assignment', title: 'Work started', message: `You have started repair work on ${c.reportNumber}. Update status when progress is made.`, link: `/contractor/jobs/${c.reportNumber}`, daysAgo: Math.round(85 - i * 1.5) });
  }
  if (c.status === 'completed') {
    msgs.push({ type: 'completion', title: 'Job completed', message: `${c.reportNumber} marked as completed and submitted for verification.`, link: `/contractor/jobs/${c.reportNumber}`, daysAgo: Math.round(83 - i * 1.5) });
  }
  msgs.forEach(m => {
    notifications.push({
      id: uid('ntf', notifications.length + 1),
      user: c.contractor, type: m.type, title: m.title, message: m.message, link: m.link,
      read: m.daysAgo > 30, createdAt: iso(m.daysAgo),
    });
  });
});

// Welcome notifications for all citizens
citizens.forEach((cit, i) => {
  notifications.push({
    id: uid('ntf', notifications.length + 1),
    user: cit.id, type: 'system', title: 'Welcome to Smart Pothole Reporter',
    message: 'Help keep our city roads safe by reporting road damage in under 60 seconds.',
    read: true, createdAt: cit.createdAt,
  });
});

// ===== ACTIVITY LOGS =====
const logs = [];
let logN = 1;
allComplaints.forEach(c => {
  const adminUser = admins[0];
  const reporterName = citizenData[c._reporterIdx - 1][0];
  logs.push({ id: uid('log', logN++), action: 'complaint.submitted', user: uid('usr_cit', c._reporterIdx), userName: reporterName, complaint: c.id, complaintNumber: c.reportNumber, description: `New complaint ${c.reportNumber} submitted by ${reporterName}`, createdAt: c.timestamps.created });

  logs.push({ id: uid('log', logN++), action: 'ai.analyzed', user: adminId, userName: 'System', complaint: c.id, complaintNumber: c.reportNumber, description: `AI analyzed ${c.reportNumber} — detected ${c.severity} severity ${c.type.replace(/_/g, ' ')} (${88 + ((c._n * 7) % 11)}%)`, createdAt: c.aiAnalysis.analyzedAt });

  if (['under_review','verified','assigned','in_progress','completed'].includes(c.status)) {
    logs.push({ id: uid('log', logN++), action: 'complaint.verified', user: adminId, userName: adminUser.name, complaint: c.id, complaintNumber: c.reportNumber, description: `${adminUser.name} verified ${c.reportNumber}`, createdAt: c.verifiedAt || iso(88 - allComplaints.indexOf(c) * 1.2) });
  }
  if (['assigned','in_progress','completed'].includes(c.status)) {
    const ctr = contractors.find(x => x.id === c.contractor);
    logs.push({ id: uid('log', logN++), action: 'complaint.assigned', user: adminId, userName: adminUser.name, complaint: c.id, complaintNumber: c.reportNumber, description: `${adminUser.name} assigned ${c.reportNumber} to ${ctr ? ctr.name : 'Contractor'}`, createdAt: c.assignedAt });
  }
  if (['in_progress','completed'].includes(c.status)) {
    const ctr = contractors.find(x => x.id === c.contractor);
    logs.push({ id: uid('log', logN++), action: 'complaint.in_progress', user: c.contractor, userName: ctr ? ctr.name : 'Contractor', complaint: c.id, complaintNumber: c.reportNumber, description: `${ctr ? ctr.name : 'Contractor'} started repair on ${c.reportNumber}`, createdAt: c.startedAt });
  }
  if (c.status === 'completed') {
    const ctr = contractors.find(x => x.id === c.contractor);
    logs.push({ id: uid('log', logN++), action: 'complaint.completed', user: c.contractor, userName: ctr ? ctr.name : 'Contractor', complaint: c.id, complaintNumber: c.reportNumber, description: `${ctr ? ctr.name : 'Contractor'} completed repair of ${c.reportNumber}`, createdAt: c.completedAt });
    if (c.feedback) {
      logs.push({ id: uid('log', logN++), action: 'feedback.submitted', user: uid('usr_cit', c._reporterIdx), userName: reporterName, complaint: c.id, complaintNumber: c.reportNumber, description: `${reporterName} rated repair of ${c.reportNumber} ${c.feedback.rating}/5`, createdAt: c.feedback.createdAt });
    }
  }
  if (c.status === 'rejected') {
    logs.push({ id: uid('log', logN++), action: 'complaint.rejected', user: adminId, userName: adminUser.name, complaint: c.id, complaintNumber: c.reportNumber, description: `${adminUser.name} rejected ${c.reportNumber}: ${c.rejectedReason.substring(0, 80)}...`, createdAt: c.timestamps.updated });
  }
});

// User registration logs
citizens.forEach((cit, i) => {
  logs.push({ id: uid('log', logN++), action: 'user.registered', user: cit.id, userName: cit.name, description: `New citizen account registered: ${cit.name}`, createdAt: cit.createdAt });
});

// ===== WRITE FILES =====
const dir = __dirname;

function writeJson(filename, data) {
  fs.writeFileSync(path.join(dir, filename), JSON.stringify(data, null, 2), 'utf8');
  console.log(`Wrote ${filename}: ${data.length} documents`);
}

writeJson('admin.json', admins.map(a => ({
  id: a.id, name: a.name, email: a.email, password: HASH, phone: a.phone,
  role: a.role, avatar: '', address: a.address, district: a.district,
  location: { lat: a.lat, lng: a.lng }, status: 'active', verified: true,
  createdAt: iso(180), updatedAt: iso(5),
})));

writeJson('contractors.json', contractors.map(c => ({
  id: c.id, name: c.name, email: c.email, password: HASH, phone: c.phone,
  role: 'contractor', avatar: '', address: `Office: ${c.district}, Tamil Nadu`, district: c.district,
  location: { lat: c.lat, lng: c.lng }, status: 'active', verified: true,
  contractor: { specialty: c.specialty, teamSize: c.teamSize, rating: c.rating, completedJobs: c.completedJobs },
  createdAt: iso(170), updatedAt: iso(3),
})));

writeJson('citizens.json', citizens);

writeJson('complaints.json', allComplaints.map(c => {
  const { _n, _reporterIdx, ...clean } = c;
  return clean;
}));

writeJson('notifications.json', notifications);

writeJson('activity_logs.json', logs);

console.log(`\nTotal: ${admins.length} admins, ${contractors.length} contractors, ${citizens.length} citizens, ${allComplaints.length} complaints, ${notifications.length} notifications, ${logs.length} activity logs`);
