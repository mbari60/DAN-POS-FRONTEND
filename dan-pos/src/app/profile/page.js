"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { User, Mail, Phone, Calendar, Edit, Save, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Importing  separated API functions
import { getCurrentUser, updateUserProfile } from '@/services/auth';
import Navbar from '@/components/Navbar';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: ''
  });

  // Fetch current user data using separated API function
  const fetchCurrentUser = async () => {
    console.log('📡 Fetching current user data...');
    setLoading(true);
    
    try {
      const userData = await getCurrentUser();
      console.log('✅ Current user data received:', userData);
      
      setUser(userData);
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        phone_number: userData.phone_number || ''
      });
      
    } catch (error) {
      console.error('❌ Error fetching current user:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update profile using separated API function
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const updatedUser = await updateUserProfile(formData);
      setUser(updatedUser);
      setEditing(false);
      toast.success('Profile updated successfully!');
      
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditing(false);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone_number: user.phone_number || ''
    });
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
         <Navbar />
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Failed to load user profile</div>
          <Button onClick={fetchCurrentUser}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const userInitials = (user.first_name && user.last_name) 
    ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
    : (user.username || 'U').charAt(0).toUpperCase();

  const fullName = user.first_name && user.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user.username;

  return (
    <div className="min-h-screen bg-gray-50">
    <Navbar />
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          
          {/* Profile Header */}
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarFallback className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {fullName}
                  </h1>
                  <p className="text-xl text-gray-600 mb-3">{user.email}</p>
                  <div className="flex justify-center sm:justify-start items-center space-x-4">
                    <Badge 
                      variant={user.is_active ? "default" : "secondary"}
                      className="text-sm px-3 py-1"
                    >
                      {user.is_active ? '✅ Active' : '❌ Inactive'}
                    </Badge>
                    {user.role && (
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        Role: {user.role.name}
                      </Badge>
                    )}
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar className="mr-1 h-4 w-4" />
                      Member since {new Date(user.date_joined).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setEditing(!editing)}
                    variant={editing ? "outline" : "default"}
                    size="lg"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {editing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="flex items-center text-xl">
                <User className="mr-2 h-6 w-6 text-blue-600" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-base">
                {editing ? 'Update your personal information below' : 'Your personal information and account details'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {!editing ? (
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <label className="text-sm font-semibold text-gray-700 flex items-center mb-3">
                        <User className="mr-2 h-4 w-4 text-blue-500" />
                        Username
                      </label>
                      <p className="text-lg font-medium text-gray-900">{user.username}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <label className="text-sm font-semibold text-gray-700 flex items-center mb-3">
                        <Mail className="mr-2 h-4 w-4 text-green-500" />
                        Email Address
                      </label>
                      <p className="text-lg font-medium text-gray-900">{user.email}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <label className="text-sm font-semibold text-gray-700 flex items-center mb-3">
                        <Phone className="mr-2 h-4 w-4 text-purple-500" />
                        Phone Number
                      </label>
                      <p className="text-lg font-medium text-gray-900">
                        {user.phone_number || (
                          <span className="text-gray-400 italic">Not provided</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <label className="text-sm font-semibold text-gray-700 mb-3 block">
                        First Name
                      </label>
                      <p className="text-lg font-medium text-gray-900">
                        {user.first_name || (
                          <span className="text-gray-400 italic">Not provided</span>
                        )}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <label className="text-sm font-semibold text-gray-700 mb-3 block">
                        Last Name
                      </label>
                      <p className="text-lg font-medium text-gray-900">
                        {user.last_name || (
                          <span className="text-gray-400 italic">Not provided</span>
                        )}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <label className="text-sm font-semibold text-gray-700 flex items-center mb-3">
                        <Calendar className="mr-2 h-4 w-4 text-orange-500" />
                        Last Login
                      </label>
                      <p className="text-lg font-medium text-gray-900">
                        {user.last_login ? 
                          new Date(user.last_login).toLocaleString() : 
                          <span className="text-gray-400 italic">Never logged in</span>
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="username" className="text-sm font-semibold text-gray-700 mb-3 block">
                          Username *
                        </label>
                        <Input
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          required
                          className="text-lg p-3 border-2 focus:border-blue-500"
                          placeholder="Enter your username"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-3 block">
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="text-lg p-3 border-2 focus:border-blue-500"
                          placeholder="Enter your email"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone_number" className="text-sm font-semibold text-gray-700 mb-3 block">
                          Phone Number
                        </label>
                        <Input
                          id="phone_number"
                          name="phone_number"
                          type="tel"
                          value={formData.phone_number}
                          onChange={handleInputChange}
                          className="text-lg p-3 border-2 focus:border-blue-500"
                          placeholder="Enter your phone number (optional)"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label htmlFor="first_name" className="text-sm font-semibold text-gray-700 mb-3 block">
                          First Name
                        </label>
                        <Input
                          id="first_name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          className="text-lg p-3 border-2 focus:border-blue-500"
                          placeholder="Enter your first name (optional)"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="last_name" className="text-sm font-semibold text-gray-700 mb-3 block">
                          Last Name
                        </label>
                        <Input
                          id="last_name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          className="text-lg p-3 border-2 focus:border-blue-500"
                          placeholder="Enter your last name (optional)"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <Button
                      type="submit"
                      disabled={isUpdating}
                      size="lg"
                      className="flex items-center px-6"
                    >
                      {isUpdating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                      size="lg"
                      className="flex items-center px-6"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;