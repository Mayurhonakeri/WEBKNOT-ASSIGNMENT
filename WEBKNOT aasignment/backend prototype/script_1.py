# Now let's create the main backend files starting with package.json
package_json = {
    "name": "campus-event-management",
    "version": "1.0.0",
    "description": "Campus Event Management Platform - Backend API",
    "main": "server.js",
    "scripts": {
        "start": "node server.js",
        "dev": "nodemon server.js",
        "test": "jest",
        "seed": "node utils/seedDatabase.js"
    },
    "keywords": ["campus", "event", "management", "node", "express", "mongodb"],
    "author": "Campus Event Management Team",
    "license": "MIT",
    "dependencies": {
        "express": "^4.18.2",
        "mongoose": "^7.5.0",
        "bcryptjs": "^2.4.3",
        "jsonwebtoken": "^9.0.2",
        "cors": "^2.8.5",
        "dotenv": "^16.3.1",
        "joi": "^17.9.2",
        "express-rate-limit": "^6.8.1",
        "helmet": "^7.0.0",
        "morgan": "^1.10.0",
        "moment": "^2.29.4"
    },
    "devDependencies": {
        "nodemon": "^3.0.1",
        "jest": "^29.6.2",
        "supertest": "^6.3.3"
    },
    "engines": {
        "node": ">=14.0.0"
    }
}

import json
with open('package.json', 'w') as f:
    json.dump(package_json, f, indent=2)

print("✅ Created package.json")
print(json.dumps(package_json, indent=2))