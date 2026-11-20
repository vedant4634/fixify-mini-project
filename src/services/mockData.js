// Fixify Initial Mock Data & Constants
// Local Indian service marketplace data for realistic startup demonstration

export const SERVICE_CATEGORIES = [
  {
    id: 'plumbing',
    name: 'Plumbing',
    slug: 'plumbing',
    icon: 'Wrench',
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80',
    shortDesc: 'Pipe repairs, tap leaks, drain cleaning, and bathroom sanitary fittings.',
    description: 'Expert plumbing solutions for residential and commercial spaces. From stubborn blockages to full fixture installations, our verified plumbers fix leaks with guaranteed workmanship.',
    startingPrice: 299,
    priceUnit: 'onwards',
    popular: true,
    rating: 4.8,
    reviewsCount: 342,
    included: [
      'Comprehensive inspection and fault diagnosis',
      'Leakage repair for pipes, faucets & flush tanks',
      'Drain clearing and block removal',
      '30-day Fixify service warranty',
      'Post-service cleanup of work area'
    ]
  },
  {
    id: 'electrical',
    name: 'Electrical Repairs',
    slug: 'electrical',
    icon: 'Zap',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    shortDesc: 'Wiring, MCB switches, fans, lights, and electrical short-circuit fixes.',
    description: 'Certified electricians to tackle power tripping, switchboard replacements, smart home lighting, and complete electrical safety audits.',
    startingPrice: 199,
    priceUnit: 'onwards',
    popular: true,
    rating: 4.9,
    reviewsCount: 420,
    included: [
      'Voltage testing & safety circuit check',
      'Switchboard, socket and MCB replacement',
      'Ceiling fan, chandelier and LED installation',
      'Zero-shock insulated tool handling',
      '30-day Fixify warranty'
    ]
  },
  {
    id: 'ac-repair',
    name: 'AC Repair & Maintenance',
    slug: 'ac-repair',
    icon: 'Wind',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
    shortDesc: 'Deep jet cleaning, gas charging, cooling issues, and seasonal servicing.',
    description: 'Stay cool all year round. Our HVAC technicians offer power jet servicing, refrigerant gas top-up, and compressor diagnostics for split and window ACs.',
    startingPrice: 499,
    priceUnit: 'per unit',
    popular: true,
    rating: 4.85,
    reviewsCount: 512,
    included: [
      'Foam jet indoor & outdoor coil cleaning',
      'Gas pressure inspection & leak check',
      'Drain pipe de-clogging',
      'Filter and cooling fin deep sanitize',
      'Temperature drop verification report'
    ]
  },
  {
    id: 'cleaning',
    name: 'Home Cleaning',
    slug: 'cleaning',
    icon: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    shortDesc: 'Deep kitchen cleaning, bathroom sanitization, and full home deep clean.',
    description: 'Spotless spaces with eco-safe chemicals and professional equipment. Ideal for move-in cleaning, post-renovation, or festival prep.',
    startingPrice: 899,
    priceUnit: 'per room',
    popular: true,
    rating: 4.75,
    reviewsCount: 290,
    included: [
      'High-pressure floor scrubbing & buffing',
      'Kitchen degreasing and chimney wiping',
      'Bathroom tile scaling & anti-bacterial scrub',
      'Balcony washing and glass window cleaning',
      'Garbage bag disposal'
    ]
  },
  {
    id: 'carpentry',
    name: 'Carpentry',
    slug: 'carpentry',
    icon: 'Hammer',
    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80',
    shortDesc: 'Furniture assembly, door lock repair, cabinet hinges, and custom woodwork.',
    description: 'Skilled carpenters for modular furniture assembly, wardrobe repairs, lock replacements, sliding door alignment, and custom wood restoration.',
    startingPrice: 349,
    priceUnit: 'onwards',
    popular: false,
    rating: 4.7,
    reviewsCount: 185,
    included: [
      'Precision measurement and fitting',
      'Hardware alignment (hinges, sliders, handles)',
      'Door lock and latch repairs',
      'Wood glue and fastener reinforcements',
      'Dust vacuuming around work area'
    ]
  },
  {
    id: 'painting',
    name: 'Painting',
    slug: 'painting',
    icon: 'Paintbrush',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    shortDesc: 'Interior wall painting, waterproof putty, texture walls, and touch-ups.',
    description: 'Transform your home with dust-free mechanized painting, waterproofing treatments, Asian Paints/Berger premium emulsions, and color consultation.',
    startingPrice: 1499,
    priceUnit: 'room touch-up',
    popular: false,
    rating: 4.8,
    reviewsCount: 160,
    included: [
      'Furniture masking with protective sheets',
      'Wall crack filling and sanding primer',
      '2 coats of premium washable paint',
      'Moisture assessment test',
      'Floor tape removal and sweep cleanup'
    ]
  },
  {
    id: 'appliance-repair',
    name: 'Appliance Repair',
    slug: 'appliance-repair',
    icon: 'Tv',
    image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=800&q=80',
    shortDesc: 'Washing machines, refrigerators, microwaves, water purifiers & geysers.',
    description: 'Quick door-step repairs for major home appliances by brand-trained mechanics using genuine spare parts with warranty.',
    startingPrice: 299,
    priceUnit: 'inspection',
    popular: true,
    rating: 4.82,
    reviewsCount: 388,
    included: [
      'Component breakdown diagnostic',
      'Drum / motor / PCB inspection',
      'Upfront quote before any part replacement',
      '30-day warranty on installed parts',
      'Safety grounding check'
    ]
  },
  {
    id: 'home-maintenance',
    name: 'Home Maintenance',
    slug: 'home-maintenance',
    icon: 'ShieldCheck',
    image: 'https://images.unsplash.com/photo-1505798577917-a65157d3320a?auto=format&fit=crop&w=800&q=80',
    shortDesc: 'Pest control, drill & hang services, water tank cleaning, and roof inspection.',
    description: 'Complete periodic home upkeep. From hanging curtains and mirrors to herbal pest control and underground water tank sanitization.',
    startingPrice: 399,
    priceUnit: 'onwards',
    popular: false,
    rating: 4.9,
    reviewsCount: 215,
    included: [
      'Multi-point inspection checklist',
      'Heavy-duty anchor drilling and mounting',
      'Herbal gel & odorless spray application',
      'UV sterilization (water tank cleaning)',
      'Digital service audit report'
    ]
  }
];

export const INITIAL_TECHNICIANS = [
  {
    id: 'tech-1',
    name: 'Rajesh Kumar',
    email: 'rajesh.plumbing@fixify.in',
    phone: '+91 98201 44521',
    city: 'Mumbai',
    category: 'Plumbing',
    skills: 'Pipe fittings, sanitary ware, pressure pumps, leak detection',
    experience: '8 years',
    experienceYears: 8,
    rating: 4.9,
    jobsCompleted: 342,
    verified: true,
    status: 'Verified',
    available: true,
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    bio: 'Licensed master plumber with over 8 years of experience servicing residential complexes across Bandra, Andheri and Powai.',
    hourlyRate: 350
  },
  {
    id: 'tech-2',
    name: 'Amit Sharma',
    email: 'amit.electric@fixify.in',
    phone: '+91 98112 39012',
    city: 'Delhi NCR',
    category: 'Electrical Repairs',
    skills: 'Short-circuit fixing, MCB panels, smart home automation, wiring',
    experience: '6 years',
    experienceYears: 6,
    rating: 4.8,
    jobsCompleted: 278,
    verified: true,
    status: 'Verified',
    available: true,
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Government certified wireman specialized in modern residential wiring, inverter setups and emergency circuit diagnostics.',
    hourlyRate: 300
  },
  {
    id: 'tech-3',
    name: 'Suresh Verma',
    email: 'suresh.ac@fixify.in',
    phone: '+91 97405 88219',
    city: 'Bengaluru',
    category: 'AC Repair & Maintenance',
    skills: 'Jet cleaning, refrigerant charging, inverter PCB troubleshooting',
    experience: '9 years',
    experienceYears: 9,
    rating: 4.95,
    jobsCompleted: 412,
    verified: true,
    status: 'Verified',
    available: true,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Former Daikin & Voltas authorized service engineer. Specializes in multi-split systems and jet deep cleaning.',
    hourlyRate: 450
  },
  {
    id: 'tech-4',
    name: 'Pooja Patil',
    email: 'pooja.clean@fixify.in',
    phone: '+91 99230 11204',
    city: 'Pune',
    category: 'Home Cleaning',
    skills: 'Deep kitchen degreasing, sofa shampooing, mechanized floor scrub',
    experience: '5 years',
    experienceYears: 5,
    rating: 4.75,
    jobsCompleted: 198,
    verified: true,
    status: 'Verified',
    available: true,
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    bio: 'Leads a verified 4-member deep cleaning crew equipped with industrial single-disc scrubbing and steam sanitizers.',
    hourlyRate: 400
  },
  {
    id: 'tech-5',
    name: 'Iqbal Ansari',
    email: 'iqbal.carpenter@fixify.in',
    phone: '+91 98920 41290',
    city: 'Mumbai',
    category: 'Carpentry',
    skills: 'Modular kitchen repair, Godrej locks, hydraulic hinges, bed assembly',
    experience: '12 years',
    experienceYears: 12,
    rating: 4.88,
    jobsCompleted: 520,
    verified: true,
    status: 'Verified',
    available: true,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: 'Third generation carpenter expert in engineered wood repairs, IKEA/Pepperfry assembly and antique wooden touch-ups.',
    hourlyRate: 400
  },
  {
    id: 'tech-6',
    name: 'Manoj Yadav',
    email: 'manoj.appliances@fixify.in',
    phone: '+91 98450 77123',
    city: 'Bengaluru',
    category: 'Appliance Repair',
    skills: 'Inverter refrigerators, front-load washing machines, microwave magnetrons',
    experience: '7 years',
    experienceYears: 7,
    rating: 4.8,
    jobsCompleted: 310,
    verified: true,
    status: 'Verified',
    available: true,
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    bio: 'Specialist in LG, Samsung and Whirlpool electronics with quick doorstep chip-level diagnosis.',
    hourlyRate: 350
  },
  {
    id: 'tech-7',
    name: 'Sunil Rao',
    email: 'sunil.applicant@fixify.in',
    phone: '+91 97110 55432',
    city: 'Hyderabad',
    category: 'Painting',
    skills: 'Texture coating, putty skimming, waterproof exterior',
    experience: '4 years',
    experienceYears: 4,
    rating: 4.6,
    jobsCompleted: 45,
    verified: false,
    status: 'Pending Verification',
    available: false,
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    bio: 'Newly registered contractor awaiting Aadhaar and police verification review by Fixify admin.',
    hourlyRate: 300
  }
];

export const INITIAL_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Kavita Iyer',
    email: 'kavita.iyer@gmail.com',
    phone: '+91 98200 12345',
    city: 'Mumbai',
    address: 'Flat 402, Sea Green Apts, Juhu Tara Road, Mumbai - 400049',
    pincode: '400049',
    bookingsCount: 4,
    totalSpent: 4250,
    status: 'Active',
    joinedDate: '2024-02-15'
  },
  {
    id: 'cust-2',
    name: 'Vikram Malhotra',
    email: 'vikram.m@outlook.com',
    phone: '+91 98101 67890',
    city: 'Delhi NCR',
    address: 'B-12, Sector 52, Noida, Gautam Buddha Nagar - 201301',
    pincode: '201301',
    bookingsCount: 2,
    totalSpent: 1890,
    status: 'Active',
    joinedDate: '2024-03-01'
  },
  {
    id: 'cust-3',
    name: 'Ananya Deshmukh',
    email: 'ananya.d@yahoo.com',
    phone: '+91 98220 98765',
    city: 'Pune',
    address: 'Rowhouse 7, Silver Meadows, Baner, Pune - 411045',
    pincode: '411045',
    bookingsCount: 6,
    totalSpent: 7499,
    status: 'Active',
    joinedDate: '2024-01-10'
  }
];

export const INITIAL_BOOKINGS = [
  {
    id: 'FIX-10821',
    customerId: 'cust-1',
    customerName: 'Kavita Iyer',
    customerPhone: '+91 98200 12345',
    serviceId: 'plumbing',
    serviceName: 'Plumbing',
    technicianId: 'tech-1',
    technicianName: 'Rajesh Kumar',
    technicianPhone: '+91 98201 44521',
    date: '2026-11-18',
    timeSlot: '10:00 AM - 12:00 PM',
    status: 'In Progress', // Pending | Confirmed | Technician Assigned | In Progress | Completed | Cancelled
    address: 'Flat 402, Sea Green Apts, Juhu Tara Road, Mumbai',
    city: 'Mumbai',
    pincode: '400049',
    lat: 19.1025,
    lng: 72.8271,
    estimatedPrice: 450,
    description: 'Master bathroom shower mixer tap is leaking heavily through the wall tile joint.',
    createdAt: '2026-11-16T14:30:00Z',
    statusHistory: [
      { status: 'Pending', time: 'Nov 16, 2:30 PM', note: 'Booking requested by customer' },
      { status: 'Confirmed', time: 'Nov 16, 2:45 PM', note: 'Booking confirmed by Fixify Dispatch' },
      { status: 'Technician Assigned', time: 'Nov 16, 3:00 PM', note: 'Assigned to Rajesh Kumar (Master Plumber)' },
      { status: 'On the Way', time: 'Nov 18, 9:30 AM', note: 'Technician is en route with toolkit' },
      { status: 'In Progress', time: 'Nov 18, 10:15 AM', note: 'Plumbing repair in progress' }
    ]
  },
  {
    id: 'FIX-10795',
    customerId: 'cust-1',
    customerName: 'Kavita Iyer',
    customerPhone: '+91 98200 12345',
    serviceId: 'ac-repair',
    serviceName: 'AC Repair & Maintenance',
    technicianId: 'tech-3',
    technicianName: 'Suresh Verma',
    technicianPhone: '+91 97405 88219',
    date: '2026-11-12',
    timeSlot: '02:00 PM - 04:00 PM',
    status: 'Completed',
    address: 'Flat 402, Sea Green Apts, Juhu Tara Road, Mumbai',
    city: 'Mumbai',
    pincode: '400049',
    lat: 19.1025,
    lng: 72.8271,
    estimatedPrice: 999,
    description: 'Split AC deep foam jet service and drain unclogging.',
    createdAt: '2026-11-10T11:00:00Z',
    rating: 5,
    review: 'Suresh arrived right on time and did an amazing deep cleaning. AC is cooling like brand new now!',
    statusHistory: [
      { status: 'Pending', time: 'Nov 10, 11:00 AM', note: 'Booking submitted' },
      { status: 'Confirmed', time: 'Nov 10, 11:20 AM', note: 'Confirmed' },
      { status: 'Completed', time: 'Nov 12, 3:45 PM', note: 'Work completed and customer approved' }
    ]
  },
  {
    id: 'FIX-10842',
    customerId: 'cust-2',
    customerName: 'Vikram Malhotra',
    customerPhone: '+91 98101 67890',
    serviceId: 'electrical',
    serviceName: 'Electrical Repairs',
    technicianId: 'tech-2',
    technicianName: 'Amit Sharma',
    technicianPhone: '+91 98112 39012',
    date: '2026-11-19',
    timeSlot: '04:00 PM - 06:00 PM',
    status: 'Confirmed',
    address: 'B-12, Sector 52, Noida',
    city: 'Delhi NCR',
    pincode: '201301',
    lat: 28.5912,
    lng: 77.3621,
    estimatedPrice: 350,
    description: 'Living room main switchboard sparking whenever geyser switch is toggled.',
    createdAt: '2026-11-17T09:15:00Z',
    statusHistory: [
      { status: 'Pending', time: 'Nov 17, 9:15 AM', note: 'Booking created' },
      { status: 'Confirmed', time: 'Nov 17, 9:30 AM', note: 'Technician Amit Sharma confirmed availability' }
    ]
  },
  {
    id: 'FIX-10850',
    customerId: 'cust-3',
    customerName: 'Ananya Deshmukh',
    customerPhone: '+91 98220 98765',
    serviceId: 'cleaning',
    serviceName: 'Home Cleaning',
    technicianId: null,
    technicianName: 'Unassigned',
    technicianPhone: '',
    date: '2026-11-20',
    timeSlot: '09:00 AM - 11:00 AM',
    status: 'Pending',
    address: 'Rowhouse 7, Silver Meadows, Baner, Pune',
    city: 'Pune',
    pincode: '411045',
    lat: 18.5590,
    lng: 73.7868,
    estimatedPrice: 1799,
    description: 'Complete 3BHK deep cleaning before housewarming ceremony.',
    createdAt: '2026-11-17T11:45:00Z',
    statusHistory: [
      { status: 'Pending', time: 'Nov 17, 11:45 AM', note: 'Awaiting technician assignment' }
    ]
  }
];

export const INITIAL_REVIEWS = [
  {
    id: 'rev-1',
    bookingId: 'FIX-10795',
    customerName: 'Kavita Iyer',
    technicianName: 'Suresh Verma',
    serviceName: 'AC Repair & Maintenance',
    rating: 5,
    date: '2026-11-12',
    comment: 'Suresh arrived right on time and did an amazing deep cleaning. AC is cooling like brand new now! Very polite and professional.',
    flagged: false
  },
  {
    id: 'rev-2',
    bookingId: 'FIX-10640',
    customerName: 'Rohan Sen',
    technicianName: 'Rajesh Kumar',
    serviceName: 'Plumbing',
    rating: 5,
    date: '2026-11-04',
    comment: 'Solved a concealed pipe leak in less than an hour that two previous local plumbers couldn’t figure out. Highly recommended!',
    flagged: false
  },
  {
    id: 'rev-3',
    bookingId: 'FIX-10512',
    customerName: 'Meera Nair',
    technicianName: 'Amit Sharma',
    serviceName: 'Electrical Repairs',
    rating: 4,
    date: '2026-10-28',
    comment: 'Very professional, carried proper safety insulation gear. Replaced 3 switchboards and tested all points neatly.',
    flagged: false
  },
  {
    id: 'rev-4',
    bookingId: 'FIX-10490',
    customerName: 'Deepak Chopra',
    technicianName: 'Iqbal Ansari',
    serviceName: 'Carpentry',
    rating: 5,
    date: '2026-10-15',
    comment: 'Assembled a 4-door wardrobe in just 2 hours. Very clean work and cleaned up all wood shavings before leaving.',
    flagged: false
  }
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Dr. Sunita Kulkarni',
    role: 'Homeowner, Pune',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    quote: 'Fixify has made finding reliable technicians effortless. The plumber arrived on time, was extremely respectful, and gave an upfront price without any hidden charges.',
    rating: 5,
    service: 'Plumbing'
  },
  {
    id: 2,
    name: 'Abhishek Mukherjee',
    role: 'IT Professional, Bengaluru',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    quote: 'Booking an AC jet service through Fixify was smooth. The technician brought his own pressurized water machine and cleaned everything without spilling a single drop on the floor.',
    rating: 5,
    service: 'AC Servicing'
  },
  {
    id: 3,
    name: 'Rashmi Nambiar',
    role: 'Interior Designer, Mumbai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    quote: 'I recommend Fixify to all my interior design clients for reliable post-work carpentry and electrical fittings. Transparent pricing and verified technicians make all the difference.',
    rating: 5,
    service: 'Carpentry & Electrical'
  }
];
