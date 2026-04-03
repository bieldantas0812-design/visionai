export async function generateImage(prompt: string, aspectRatio: string = '1:1') {
  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, aspectRatio }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao gerar imagem no servidor.');
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error("Erro na geração de imagem:", error);
    throw error;
  }
}
