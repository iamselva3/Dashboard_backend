import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DataPoint from '../models/DataPoint.js';
import connectDB from '../config/db.js';

dotenv.config();

const importData = async () => {
    try {
        await connectDB();

        // Read JSON file
        const jsonData = JSON.parse(fs.readFileSync('jsondata.json', 'utf-8'));

        // Transform data
        const dataPoints = jsonData.map(item => ({
            ...item,
            filters: {
                topics: item.topic ? [item.topic] : [],
                sectors: item.sector ? [item.sector] : [],
                regions: item.region ? [item.region] : [],
                countries: item.country ? [item.country] : [],
                cities: item.city ? [item.city] : []
            }
        }));

        // Clear existing data
        await DataPoint.deleteMany();

        // Insert new data
        await DataPoint.insertMany(dataPoints);

        console.log('Data imported successfully!');
        console.log(`Total records: ${dataPoints.length}`);

        process.exit();
    } catch (error) {
        console.error('Error importing data:', error);
        process.exit(1);
    }
};

importData();