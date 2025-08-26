import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Brain, 
  BarChart3, 
  MessageCircle, 
  Upload, 
  Users, 
  Award, 
  Zap,
  ChevronRight,
  Play,
  Star,
  CheckCircle
} from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <BookOpen className="h-8 w-8 text-blue-500" />
                <span className="ml-2 text-xl font-bold text-white">EduDesk</span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How it Works</a>
              <Link to="/login" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                Login
              </Link>
              <Link to="/signup" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-white">Smart Learning with</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                AI-Powered EduDesk
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Upload your PDFs, generate intelligent quizzes, track your progress, and get instant help from our AI chatbot. 
              Transform your learning experience with cutting-edge technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center">
                Get Started Free
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for Modern Learning</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need to enhance your study experience with the power of artificial intelligence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* PDF Upload */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all hover:transform hover:scale-105">
              <div className="bg-blue-600/20 p-3 rounded-lg w-fit mb-4">
                <Upload className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">PDF Upload</h3>
              <p className="text-gray-400">
                Easily upload your study materials and documents. Access them anytime, anywhere.
              </p>
            </div>

            {/* AI Quiz Generation */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all hover:transform hover:scale-105">
              <div className="bg-purple-600/20 p-3 rounded-lg w-fit mb-4">
                <Brain className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Quiz Generation</h3>
              <p className="text-gray-400">
                Generate intelligent quizzes from your PDFs using advanced AI algorithms.
              </p>
            </div>

            {/* Analytics */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-green-500/50 transition-all hover:transform hover:scale-105">
              <div className="bg-green-600/20 p-3 rounded-lg w-fit mb-4">
                <BarChart3 className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Progress Analytics</h3>
              <p className="text-gray-400">
                Track your learning progress with detailed analytics and performance insights.
              </p>
            </div>

            {/* AI Chatbot */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-orange-500/50 transition-all hover:transform hover:scale-105">
              <div className="bg-orange-600/20 p-3 rounded-lg w-fit mb-4">
                <MessageCircle className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Chatbot</h3>
              <p className="text-gray-400">
                Get instant answers and study help from our intelligent chatbot assistant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How EduDesk Works</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Simple steps to transform your learning experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Your PDFs</h3>
              <p className="text-gray-400">
                Upload your study materials, textbooks, or any educational PDFs to your personal library.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Generate AI Quizzes</h3>
              <p className="text-gray-400">
                Our AI analyzes your content and creates personalized quizzes to test your knowledge.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-pink-600 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track & Improve</h3>
              <p className="text-gray-400">
                Monitor your progress, identify weak areas, and get help from our AI chatbot.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">10K+</div>
              <div className="text-gray-400">Students Learning</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">50K+</div>
              <div className="text-gray-400">Quizzes Generated</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">25K+</div>
              <div className="text-gray-400">PDFs Processed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">98%</div>
              <div className="text-gray-400">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Students Say</h2>
            <p className="text-gray-400 text-lg">Real experiences from our learning community</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "EduDesk has revolutionized my study routine. The AI-generated quizzes help me understand my weak points instantly."
              </p>
              <div className="font-semibold">Sarah Johnson</div>
              <div className="text-sm text-gray-400">Computer Science Student</div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "The analytics feature is amazing! I can track my progress and see improvement over time. Highly recommended!"
              </p>
              <div className="font-semibold">Michael Chen</div>
              <div className="text-sm text-gray-400">Medical Student</div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "The chatbot is like having a personal tutor available 24/7. It answers all my questions instantly!"
              </p>
              <div className="font-semibold">Emily Rodriguez</div>
              <div className="text-sm text-gray-400">Engineering Student</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join thousands of students who have already enhanced their study experience with EduDesk.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105">
              Start Learning Today
            </Link>
            <Link to="/login" className="border border-gray-600 hover:border-gray-500 px-8 py-4 rounded-lg font-semibold text-lg transition-all">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
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
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>PDF Upload</li>
                <li>AI Quiz Generation</li>
                <li>Progress Analytics</li>
                <li>AI Chatbot</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
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
    </div>
  );
};

export default Home;