import { useState } from 'react'
import './CreateJobListing.css'

function CreateJobListing({ onClose, onCreated, onUpdated, initialJob = null }) {
  const isEditMode = Boolean(initialJob)

  const [title, setTitle] = useState(initialJob?.title ?? '')
  const [company, setCompany] = useState(initialJob?.company ?? '')
  const [jobType, setJobType] = useState(initialJob?.jobType ?? 'full-time')
  const [industryInput, setIndustryInput] = useState(initialJob?.industry ?? '')
  const [salary, setSalary] = useState(initialJob?.salary ?? '')
  const [location, setLocation] = useState(initialJob?.location ?? '')
  const [description, setDescription] = useState(initialJob?.description ?? '')
  const [isActive, setIsActive] = useState(initialJob?.isActive ?? true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    if (!industryInput) {
      setError('Please select an industry')
      setSubmitting(false)
      return
    }

    const payload = {
      title: title.trim(),
      company: company.trim(),
      jobType,
      industry: industryInput,
      salary: Number(salary),
      location: location.trim(),
      description: description.trim(),
      isActive
    }

    try {
      const endpoint = isEditMode ? `/api/updateJob/${initialJob.jobId}` : '/api/jobs'
      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create job listing')
      }

      if (isEditMode) {
        if (onUpdated) onUpdated(data)
      } else if (onCreated) {
        onCreated(data)
      }

      onClose()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='create-job-modal' onClick={onClose}>
      <div className='create-job-panel' onClick={(event) => event.stopPropagation()}>
        <button className='close-button click-button !bg-secondary flex justify-center items-center' onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
        </button>
        <h1>{isEditMode ? 'Edit Job Listing' : 'Create Job Listing'}</h1>

        <form className='create-job-form' onSubmit={handleSubmit}>
          <label htmlFor='create-title'>Title</label>
          <input id='create-title' value={title} onChange={(event) => setTitle(event.target.value)} required />

          <label htmlFor='create-company'>Company</label>
          <input id='create-company' value={company} onChange={(event) => setCompany(event.target.value)} required />

          <label htmlFor='create-job-type'>Job Type</label>
          <select id='create-job-type' value={jobType} onChange={(event) => setJobType(event.target.value)}>
            <option value='full-time'>Full-time</option>
            <option value='part-time'>Part-time</option>
            <option value='contract'>Contract</option>
            <option value='internship'>Internship</option>
          </select>

          <label htmlFor='create-industry'>Industry</label>
          <select
            id='create-industry'
            value={industryInput}
            onChange={(event) => setIndustryInput(event.target.value)}
            required
          >
            <option value=''>-- Select an industry --</option>
            <option value='Information Technology'>Information Technology</option>
            <option value='Healthcare'>Healthcare</option>
            <option value='Education'>Education</option>
            <option value='Finance'>Finance</option>
            <option value='Retail'>Retail</option>
            <option value='Manufacturing'>Manufacturing</option>
            <option value='Construction'>Construction</option>
            <option value='Hospitality'>Hospitality</option>
            <option value='Transportation and Logistics'>Transportation and Logistics</option>
            <option value='Sales'>Sales</option>
            <option value='Marketing and Advertising'>Marketing and Advertising</option>
            <option value='Customer Service'>Customer Service</option>
            <option value='Government and Public Administration'>Government and Public Administration</option>
            <option value='Engineering'>Engineering</option>
            <option value='Real Estate'>Real Estate</option>
            <option value='Media and Entertainment'>Media and Entertainment</option>
            <option value='Telecommunications'>Telecommunications</option>
            <option value='Agriculture'>Agriculture</option>
            <option value='Energy and Utilities'>Energy and Utilities</option>
            <option value='Legal Services'>Legal Services</option>
          </select>

          <label htmlFor='create-salary'>Salary</label>
          <input
            id='create-salary'
            type='number'
            min='1'
            value={salary}
            onChange={(event) => setSalary(event.target.value)}
            required
          />

          <label htmlFor='create-location'>Location</label>
          <input id='create-location' value={location} onChange={(event) => setLocation(event.target.value)} required />

          <label htmlFor='create-description'>Description</label>
          <textarea
            id='create-description'
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            required
          />

          <label className='active-checkbox'>
            <input type='checkbox' checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
            Active listing
          </label>

          {error && <p className='form-error'>{error}</p>}

          <button type='submit' className='submit-job-btn' disabled={submitting}>
            {submitting ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Job')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateJobListing
