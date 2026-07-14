export function useImageUpload() {
    const uploadImage = async (file) => {
        if (!file) return null

        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', 'campus_connect')

        const res = await fetch('https://api.cloudinary.com/v1_1/demo/image/upload', {
            method: 'POST',
            body: formData,
        })

        if (!res.ok) throw new Error('Upload failed')
        const data = await res.json()
        return data.secure_url
    }

    return { uploadImage }
}
