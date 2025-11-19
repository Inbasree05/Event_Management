import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Artist from './models/Artist.js';

dotenv.config();

const sampleArtists = [
  {
    name: 'Priya Sharma',
    email: 'priya.makeup@example.com',
    phone: '+919876543210',
    location: 'Chennai',
    experience: '8 years',
    specialty: ['Bridal Makeup', 'Party Makeup', 'Fashion'],
    about: 'Priya is a professional makeup artist with over 8 years of experience in the industry. She specializes in bridal and party makeup, creating stunning looks that enhance natural beauty.',
    profileImage: 'https://randomuser.me/api/portraits/women/32.jpg',
    portfolioImages: [
      'https://images.unsplash.com/photo-1515886653613-0348dbda7560?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1519699047748-de8e457b634e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    ],
    services: [
      { name: 'Bridal Makeup', price: 10000, description: 'Complete bridal makeup with trial' },
      { name: 'Bridal Makeup with Hair', price: 15000, description: 'Bridal makeup with hair styling' },
      { name: 'Party Makeup', price: 5000, description: 'Evening or party makeup' }
    ],
    socialMedia: {
      instagram: 'priya_makeup_artist',
      facebook: 'priyamakeupart',
      website: 'www.priyamakeup.com'
    }
  },
  {
    name: 'Rahul Kapoor',
    email: 'rahul.makeup@example.com',
    phone: '+919876543211',
    location: 'Mumbai',
    experience: '5 years',
    specialty: ['Groom Grooming', 'Bridal Makeup', 'Fashion'],
    about: 'Rahul is a talented makeup artist known for his expertise in groom grooming and men\'s fashion. He brings out the best in every client with his attention to detail.',
    profileImage: 'https://randomuser.me/api/portraits/men/42.jpg',
    portfolioImages: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    ],
    services: [
      { name: 'Groom Grooming', price: 8000, description: 'Complete grooming for the groom' },
      { name: 'Bridal Makeup', price: 12000, description: 'Complete bridal makeup with trial' },
      { name: 'Makeup Consultation', price: 2000, description: 'One-on-one consultation' }
    ],
    socialMedia: {
      instagram: 'rahul_makeup_artist',
      facebook: 'rahulmakeupart',
      website: 'www.rahulmakeup.com'
    }
  },
  {
    name: 'Ananya Reddy',
    email: 'ananya.makeup@example.com',
    phone: '+919876543212',
    location: 'Bangalore',
    experience: '10 years',
    specialty: ['Bridal Makeup', 'Fashion', 'Editorial'],
    about: 'With over a decade of experience, Ananya is one of the most sought-after makeup artists in Bangalore. Her work has been featured in several fashion magazines and runways.',
    profileImage: 'https://randomuser.me/api/portraits/women/65.jpg',
    portfolioImages: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    ],
    services: [
      { name: 'Bridal Makeup', price: 15000, description: 'Luxury bridal package' },
      { name: 'Fashion Shoot Makeup', price: 8000, description: 'Makeup for fashion shoots' },
      { name: 'Makeup Workshop', price: 5000, description: 'Learn professional makeup techniques' }
    ],
    socialMedia: {
      instagram: 'ananya_makeup_pro',
      facebook: 'ananyamakeupstudio',
      website: 'www.ananyamakeup.com'
    },
    isFeatured: true
  }
];

const seedDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    // Clear existing data
    await Artist.deleteMany({});
    console.log('Cleared existing artists');

    // Insert sample data
    const createdArtists = await Artist.insertMany(sampleArtists);
    console.log(`Seeded ${createdArtists.length} artists`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
