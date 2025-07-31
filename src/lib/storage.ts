export const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

export const loadFromStorage = (key: string, defaultValue: any = []) => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch (error) {
    console.error('Failed to load from localStorage:', error)
    return defaultValue
  }
}

export const clearFormState = () => {
  // Clear any form state that might persist between edits
  const formKeys = ['lastFormData', 'lastMemberData', 'lastMonsterData']
  formKeys.forEach(key => localStorage.removeItem(key))
}