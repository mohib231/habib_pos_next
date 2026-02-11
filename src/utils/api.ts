export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {},
) => {
  const token = localStorage.getItem('token')

  // FIX: Explicitly type this as a Record so we can add properties to it
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Merge external headers if they exist
  if (options.headers) {
    // We cast options.headers to ensure it matches our simple object structure
    Object.assign(headers, options.headers as Record<string, string>)
  }

  // Add the token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  } else {
    console.warn('No token found in localStorage')
  }

  // Debugging: Log the headers being sent
  // console.log('Request Headers:', headers)

  try {
    const response = await fetch(url, {
      ...options,
      headers, // fetch() happily accepts Record<string, string>
    })

    if (response.status === 401) {
      console.warn('Session expired. Redirecting to login...')
      localStorage.removeItem('token')
      window.location.href = '/sign-in'
      return response
    }

    return response
  } catch (error) {
    console.error('Network request failed:', error)
    throw error
  }
}
