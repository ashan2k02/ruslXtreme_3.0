export interface CommitteeProfile {
  id: string
  name: string
  title: string
  team: string
  bio?: string
  portrait: string
  featured?: boolean
  linkedin?: string
  github?: string
  portfolio?: string
}

export interface CommitteeTeam {
  id: string
  name: string
  description: string
  members: CommitteeProfile[]
}

const portraits = [
  '/assets/committee/portrait-01.svg',
  '/assets/committee/portrait-02.svg',
  '/assets/committee/portrait-03.svg',
  '/assets/committee/portrait-04.svg',
  '/assets/committee/portrait-05.svg',
  '/assets/committee/portrait-06.svg',
]

// Official Leadership Profiles (From verified committee form submissions)
export const committeeLeadership: CommitteeProfile[] = [
  {
    id: 'ashan-eranga',
    name: 'Ashan Eranga',
    title: 'Project Chair',
    team: 'Leadership',
    bio: 'Project Chair orchestrating the mission architecture, cross-team operations, and competition execution for RUSLXTREME 3.0.',
    portrait: portraits[0],
    featured: true,
    linkedin: 'https://www.linkedin.com/in/ashaneranga',
    github: 'https://github.com/ashan2k02',
    portfolio: 'https://ashaneranga.me',
  },
  {
    id: 'chandima-wickramanayaka',
    name: 'W. Chandima Wickramanayaka',
    title: 'Secretary',
    team: 'Leadership',
    bio: 'Secretary coordinating official communications, record-keeping, institutional alignment, and operational workflows across all mission tracks.',
    portrait: portraits[1],
    featured: true,
    linkedin: 'https://www.linkedin.com/in/chandima22',
    github: 'https://github.com/chandima22',
  },
]

// Official Committee Teams and Members (From verified committee form submissions)
export const committeeTeams: CommitteeTeam[] = [
  {
    id: 'design',
    name: 'Design Team',
    description: 'Shapes the visual language, interface surfaces, and moments that make the mission memorable.',
    members: [
      {
        id: 'shajith-sivananthy',
        name: 'Shajith Sivananthy',
        title: 'Design Team Member',
        team: 'Design Team',
        portrait: portraits[2],
        linkedin: 'https://www.linkedin.com/in/shajith-sivananthy-1b5b92256',
        github: 'https://github.com/ShajithSiva',
        portfolio: 'https://shajith.vercel.app',
      },
      {
        id: 'lahiru-sathsara-wijayamal',
        name: 'W.M.Lahiru Sathsara Wijayamal',
        title: 'Designer',
        team: 'Design Team',
        portrait: portraits[3],
        linkedin: 'https://www.linkedin.com/in/lahiru-sathsara',
        portfolio: 'https://propix.work.gd',
      },
      {
        id: 'chirantha-kasun-ekanayaka',
        name: 'Ekanayaka Mudiyanselage Chirantha Kasun Ekanayaka',
        title: 'Design Team Member',
        team: 'Design Team',
        portrait: portraits[4],
        linkedin: 'https://www.linkedin.com/in/chirantha-kasun-899393202',
        github: 'https://github.com/chiranthakasun',
      },
      {
        id: 'dineth-deshan',
        name: 'Jayasekara Liyanaarachchige Dineth Deshan',
        title: 'Design Team Member',
        team: 'Design Team',
        portrait: portraits[5],
        linkedin: 'https://www.linkedin.com/in/j-l-d-deshan-8a2045237',
      },
      {
        id: 'samudu-dasantha-pathmalal',
        name: 'Samrappuli Mudiyanselage Samudu Dasantha Pathmalal',
        title: 'Design Team Member',
        team: 'Design Team',
        portrait: portraits[0],
        linkedin: 'https://www.linkedin.com/in/samudu-dasantha-749461324',
      },
    ],
  },
  {
    id: 'content',
    name: 'Content Writing Team',
    description: 'Turns the event brief into clear stories, announcements, and mission-ready communication.',
    members: [
      {
        id: 'prathibhani-witharana',
        name: 'W D P Prathibhani Witharana',
        title: 'Team Lead - Content Writing',
        team: 'Content Writing Team',
        portrait: portraits[1],
        linkedin: 'https://www.linkedin.com/in/prathibhani-witharana-88430633b',
      },
      {
        id: 'ushara-piyumi-jayatissa',
        name: 'A.D.Ushara Piyumi Jayatissa',
        title: 'Content Writing Team Member',
        team: 'Content Writing Team',
        portrait: portraits[2],
        linkedin: 'https://www.linkedin.com/in/ushara-jayatissa-1950ba356',
      },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing Team',
    description: 'Builds reach and momentum around the competition across the right channels.',
    members: [
      {
        id: 'pamodha-vikum-wanasinghe',
        name: 'Wanasinghe Mudiyanselage Pamodha Vikum Wanasinghe',
        title: 'Marketing Team Member',
        team: 'Marketing Team',
        portrait: portraits[3],
        linkedin: 'https://www.linkedin.com/in/pamodhavikumwanasinghe',
      },
    ],
  },
  {
    id: 'finance',
    name: 'Finance Team',
    description: 'Keeps the mission resourced with careful planning and transparent coordination.',
    members: [
      {
        id: 'akindu-dulwan-jayaweera',
        name: 'JAYAWEERA PATABENDIGE AKINDU DULWAN JAYAWEERA',
        title: 'Finance Team Lead',
        team: 'Finance Team',
        portrait: portraits[4],
        linkedin: 'https://www.linkedin.com/in/akindu-dulwan',
        github: 'https://github.com/akindudulwan',
      },
      {
        id: 'sanduni-hasarandi',
        name: 'Kalehewaththa Kankanamge Sanduni Hasarandi',
        title: 'Finance Team Member',
        team: 'Finance Team',
        portrait: portraits[5],
        linkedin: 'https://www.linkedin.com/in/sanduni-hasarandi-7779a9420',
      },
      {
        id: 'kalani-tharushika-wijerathna',
        name: 'Amangiri Haluge Kalani Tharushika Wijerathna',
        title: 'Finance Team Member',
        team: 'Finance Team',
        portrait: portraits[0],
        linkedin: 'https://www.linkedin.com/in/kalani-tharushika-659a123ab',
      },
      {
        id: 'chanumi-dayandi-wijayarathna',
        name: 'Chanumi Dayandi Wijayarathna',
        title: 'Finance Team Member',
        team: 'Finance Team',
        portrait: portraits[1],
      },
      {
        id: 'tharushika-wickramasinghe',
        name: 'D.D.Tharushika Wickramasinghe',
        title: 'Finance Team Member',
        team: 'Finance Team',
        portrait: portraits[2],
        linkedin: 'https://www.linkedin.com/in/devindi-wickramasinghe-20671a428',
      },
      {
        id: 'ahinsa-madushika-sirirathna',
        name: 'Kurulu Ange Gedara Ahinsa Madushika Gihani Sirirathna',
        title: 'Finance Team Member',
        team: 'Finance Team',
        portrait: portraits[3],
        linkedin: 'https://www.linkedin.com/in/ahinsa-madushika-gihani-sirirathna-759a74315',
        github: 'https://github.com/AhinsaMadushika',
      },
      {
        id: 'imashi-kaushalya-silva',
        name: 'A .Imashi Kaushalya Silva',
        title: 'Finance Team Member',
        team: 'Finance Team',
        portrait: portraits[4],
        linkedin: 'https://www.linkedin.com/in/imashi-kaushalya-001a61373',
      },
      {
        id: 'kaushani-shavindi-rathnayaka',
        name: 'Rathnayaka Mudiyanselage Kaushani Shavindi Rathnayaka',
        title: 'Finance Team Member',
        team: 'Finance Team',
        portrait: portraits[5],
        linkedin: 'https://www.linkedin.com/in/shavindi-rathnayaka-2773a7342',
      },
      {
        id: 'mohammed-mumthas-nuha',
        name: 'Mohammed Mumthas Nuha',
        title: 'Finance Team Member',
        team: 'Finance Team',
        portrait: portraits[0],
      },
    ],
  },
  {
    id: 'moderators',
    name: 'Moderators',
    description: 'Protects a fair, focused, and welcoming experience for every competitor.',
    members: [
      {
        id: 'nethmi-ama',
        name: 'Adikari Mudiyanslage Nethmi Ama',
        title: 'Moderator',
        team: 'Moderators',
        portrait: portraits[1],
      },
      {
        id: 'imasha-upamali-rathnasiri',
        name: 'G.G.Imasha Upamali Rathnasiri',
        title: 'Moderator',
        team: 'Moderators',
        portrait: portraits[2],
      },
    ],
  },
  {
    id: 'program',
    name: 'Program Team',
    description: 'Coordinates the competitive programming experience and its technical rhythm.',
    members: [
      {
        id: 'chavindu-pahasara-kodagoda',
        name: 'Chavindu Pahasara Kodagoda',
        title: 'Program Team Member',
        team: 'Program Team',
        portrait: portraits[3],
        linkedin: 'https://www.linkedin.com/in/chavindu-pahasara-kodagoda-bb9998341',
        github: 'https://github.com/Pahasara-Kodagoda',
        portfolio: 'https://dev-portfolio-gnz3.vercel.app',
      },
      {
        id: 'imalka-ashen-thilakarathna',
        name: 'Disanayaka Mudiyanselage Imalka Ashen Thilakarathna',
        title: 'Program Team Member',
        team: 'Program Team',
        portrait: portraits[4],
        linkedin: 'https://www.linkedin.com/in/imalka-ashen-7b0246309',
      },
      {
        id: 'tharushi-himaya',
        name: 'R.G.Tharushi Himaya',
        title: 'Program Team Member',
        team: 'Program Team',
        portrait: portraits[5],
      },
    ],
  },
  {
    id: 'logistic',
    name: 'Logistic Team',
    description: 'Moves people, places, and practical details into alignment for launch day.',
    members: [
      {
        id: 'senal-dilanka-ariyarathna',
        name: 'Jayasinghe Pelige Senal Dilanka Dilhan Ariyarathna',
        title: 'Logistic Team Member',
        team: 'Logistic Team',
        portrait: portraits[0],
        linkedin: 'https://www.linkedin.com/in/senaldilanka',
        github: 'https://github.com/SenalDilanka',
        portfolio: 'https://senalsportfolio.netlify.app',
      },
      {
        id: 'dhananjaya-sumanarathna',
        name: 'O.G.S.D.S.Sumanarathna',
        title: 'Logistic Team Member',
        team: 'Logistic Team',
        portrait: portraits[1],
        linkedin: 'https://www.linkedin.com/in/dhananjayasampath',
        github: 'https://github.com/DhananjayaSampath',
        portfolio: 'https://dhananjayasampath.github.io/my-portfolio',
      },
      {
        id: 'dinithi-sewmini-perera',
        name: 'P. Dinithi Sewmini Perera',
        title: 'Logistic Team Member',
        team: 'Logistic Team',
        portrait: portraits[2],
        linkedin: 'https://www.linkedin.com/in/dinithi-sewmini-perera-98b2462a0',
        github: 'https://github.com/SewminiPerera',
        portfolio: 'https://sewminiperera.github.io/portfolio.github.io',
      },
      {
        id: 'imashi-navodya-wimaladharma',
        name: 'G.G.Imashi Navodya Wimaladharma',
        title: 'Logistic Team Member',
        team: 'Logistic Team',
        portrait: portraits[3],
        linkedin: 'https://www.linkedin.com/in/imashi-wimaladharma-8ab5802a3',
      },
    ],
  },
]
