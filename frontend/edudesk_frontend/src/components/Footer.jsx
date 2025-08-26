import React from 'react';
import { BookOpen, CheckCircle, Zap, Award } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold">EduDesk</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Empowering students with AI-driven learning tools. Upload, learn, quiz, and grow with EduDesk.
            </p>
            <div className="flex space-x-4">
              <div className="bg-gray-700 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="bg-gray-700 p-2 rounded-lg">
                <Zap className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="bg-gray-700 p-2 rounded-lg">
                <Award className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">Features</h3>
            <ul className="space-y-2 text-gray-400">
              <li>PDF Upload</li>
              <li>AI Quiz Generation</li>
              <li>Progress Analytics</li>
              <li>AI Chatbot</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Help Center</li>
              <li>Contact Us</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 EduDesk. All rights reserved. Built with ❤️ for students.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
