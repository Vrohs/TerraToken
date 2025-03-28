import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

// Define TypeScript interfaces
interface FormData {
  projectName: string;
  projectType: string;
  location: string;
  description: string;
  startDate: string;
  endDate: string;
  estimatedCredits: string;
  methodology: string;
  contactName: string;
  contactEmail: string;
  files: File[];
}

interface FormErrors {
  projectName?: string;
  projectType?: string;
  location?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  estimatedCredits?: string;
  methodology?: string;
  contactName?: string;
  contactEmail?: string;
  files?: string;
  submit?: string;
  [key: string]: string | undefined;
}

const ProjectSubmission = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    projectType: '',
    location: '',
    description: '',
    startDate: '',
    endDate: '',
    estimatedCredits: '',
    methodology: '',
    contactName: '',
    contactEmail: '',
    files: []
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const projectTypes = [
    'Renewable Energy',
    'Forest Conservation',
    'Reforestation',
    'Methane Capture',
    'Energy Efficiency',
    'Agricultural Management',
    'Other'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(e.target.files || []);
    setFormData({
      ...formData,
      files: [...formData.files, ...fileList]
    });
  };

  const removeFile = (fileIndex: number) => {
    const updatedFiles = formData.files.filter((_, index) => index !== fileIndex);
    setFormData({
      ...formData,
      files: updatedFiles
    });
  };

  const validateStep = (stepNumber: number) => {
    let stepErrors: FormErrors = {};
    let isValid = true;

    if (stepNumber === 1) {
      if (!formData.projectName.trim()) {
        stepErrors.projectName = 'Project name is required';
        isValid = false;
      }
      
      if (!formData.projectType) {
        stepErrors.projectType = 'Project type is required';
        isValid = false;
      }
      
      if (!formData.location.trim()) {
        stepErrors.location = 'Location is required';
        isValid = false;
      }
      
      if (!formData.description.trim()) {
        stepErrors.description = 'Description is required';
        isValid = false;
      }
    }
    
    if (stepNumber === 2) {
      if (!formData.startDate) {
        stepErrors.startDate = 'Start date is required';
        isValid = false;
      }
      
      if (!formData.endDate) {
        stepErrors.endDate = 'End date is required';
        isValid = false;
      } else if (formData.endDate <= formData.startDate) {
        stepErrors.endDate = 'End date must be after start date';
        isValid = false;
      }
      
      if (!formData.estimatedCredits) {
        stepErrors.estimatedCredits = 'Estimated credits is required';
        isValid = false;
      } else if (isNaN(Number(formData.estimatedCredits)) || Number(formData.estimatedCredits) <= 0) {
        stepErrors.estimatedCredits = 'Must be a positive number';
        isValid = false;
      }
      
      if (!formData.methodology.trim()) {
        stepErrors.methodology = 'Methodology is required';
        isValid = false;
      }
    }
    
    if (stepNumber === 3) {
      if (!formData.contactName.trim()) {
        stepErrors.contactName = 'Contact name is required';
        isValid = false;
      }
      
      if (!formData.contactEmail.trim()) {
        stepErrors.contactEmail = 'Contact email is required';
        isValid = false;
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.contactEmail)) {
          stepErrors.contactEmail = 'Please enter a valid email';
          isValid = false;
        }
      }
      
      if (formData.files.length === 0) {
        stepErrors.files = 'At least one document is required';
        isValid = false;
      }
    }

    setErrors(stepErrors);
    return isValid;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(step)) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real app, you'd upload files to IPFS here and get CIDs
      // Then submit form data + IPFS CIDs to your backend
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting project:', error);
      setErrors({
        ...errors,
        submit: 'Failed to submit project. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render success state
  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">Project Submitted Successfully!</h2>
          <p className="text-green-700 mb-6">
            Your project has been submitted for review. You will receive email updates about the verification process.
          </p>
          <p className="text-sm text-green-600 mb-4">
            Reference ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Submit Carbon Project</h1>
      
      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        <div className={`flex items-center justify-center h-10 w-10 rounded-full border-2 ${
          step >= 1 ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 text-gray-500'
        }`}>
          1
        </div>
        <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
        <div className={`flex items-center justify-center h-10 w-10 rounded-full border-2 ${
          step >= 2 ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 text-gray-500'
        }`}>
          2
        </div>
        <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
        <div className={`flex items-center justify-center h-10 w-10 rounded-full border-2 ${
          step >= 3 ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 text-gray-500'
        }`}>
          3
        </div>
      </div>
      
      {/* Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Project Details */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Project Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name*
                  </label>
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleChange}
                    className={`w-full border ${errors.projectName ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
                  />
                  {errors.projectName && (
                    <p className="text-red-500 text-sm mt-1">{errors.projectName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Type*
                  </label>
                  <select
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    className={`w-full border ${errors.projectType ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
                  >
                    <option value="">Select a project type</option>
                    {projectTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.projectType && (
                    <p className="text-red-500 text-sm mt-1">{errors.projectType}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location*
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
                    placeholder="Country, Region"
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Description*
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
                    placeholder="Describe your carbon reduction project"
                  ></textarea>
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Technical Details */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Technical Details</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date*
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className={`w-full border ${errors.startDate ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
                    />
                    {errors.startDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date*
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className={`w-full border ${errors.endDate ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
                    />
                    {errors.endDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Carbon Credits (tonnes CO₂)*
                  </label>
                  <input
                    type="number"
                    name="estimatedCredits"
                    value={formData.estimatedCredits}
                    onChange={handleChange}
                    min="1"
                    className={`w-full border ${errors.estimatedCredits ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
                  />
                  {errors.estimatedCredits && (
                    <p className="text-red-500 text-sm mt-1">{errors.estimatedCredits}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Methodology*
                  </label>
                  <textarea
                    name="methodology"
                    value={formData.methodology}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full border ${errors.methodology ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
                    placeholder="Describe the methodology used to calculate carbon reduction"
                  ></textarea>
                  {errors.methodology && (
                    <p className="text-red-500 text-sm mt-1">{errors.methodology}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Contact & Documentation */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Contact & Documentation</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name*
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    className={`w-full border ${errors.contactName ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
                  />
                  {errors.contactName && (
                    <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email*
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className={`w-full border ${errors.contactEmail ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
                  />
                  {errors.contactEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Documentation*
                  </label>
                  <div className={`border-2 border-dashed p-4 rounded-lg text-center ${errors.files ? 'border-red-500' : 'border-gray-300'}`}>
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload project documentation, verification reports, and other relevant files
                    </p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      Select Files
                    </label>
                    
                    {errors.files && (
                      <p className="text-red-500 text-sm mt-2">{errors.files}</p>
                    )}
                  </div>
                  
                  {/* File List */}
                  {formData.files.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Selected Files:</p>
                      <ul className="space-y-2">
                        {formData.files.map((file, index) => (
                          <li key={index} className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <span>{file.name}</span>
                            <button 
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              {errors.submit && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{errors.submit}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Previous
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="ml-auto flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Next <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="ml-auto bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Project'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectSubmission;