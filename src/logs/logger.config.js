import winston from 'winston';
import {
    envEntorno
} from '../config.js';
import customLevels from './custom.logger.js';

const devLogger = winston.createLogger({
    levels: customLevels.levels,
    transports: [new winston.transports.Console({
        level: 'debug',
        format: winston.format.combine(
            winston.format.colorize({colors: customLevels.colors}), 
            winston.format.simple())
    })]
});

const prodLogger = winston.createLogger({
    levels: customLevels.levels,
    transports: [
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                winston.format.colorize({colors: customLevels.colors}), 
                winston.format.simple())
        }),
        new winston.transports.File({
            filename: './errors.log',
            level: 'error',
            format: 
                winston.format.simple()
        })
    ]
});

export const addLogger = (req, res, next) => {
    req.logger = envEntorno === 'PRODUCTION' ? prodLogger : devLogger;
    req.logger.http(`${req.method} en ${req.url} - ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
    next();
};