/* I added this so that my localhost:3000 would have a content displayed instead of blank screen. */
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Hello</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #e53e3e; }
            ul { background: #f8f9fa; padding: 20px; border-radius: 4px; }
            li { margin: 8px 0; }
            a { color: #3182ce; text-decoration: none; }
            a:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1> WHAT'S UP! </h1>
            <p>The authentication system is running successfully!</p>
            <p>💾 Database: Connected to Aiven MySQL</p>
        </div>
    </body>
    </html>
    `;
  }

  @Get('status')
  getStatus() {
    return {
      message: 'NestJS Authentication API is running! 🚀',
      endpoints: {
        register: 'POST /auth/register',
        login: 'POST /auth/login', 
        logout: 'POST /auth/logout',
        refresh: 'POST /auth/refresh',
        users: 'GET /users (requires JWT)',
      },
      timestamp: new Date().toISOString(),
      database: 'Connected to Aiven MySQL'
    };
  }
}