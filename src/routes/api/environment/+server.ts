// Простой пример
export async function GET() {
	try {
		// Запрос к стороннему API
		const response = await fetch('https://api.openaq.org/v2/latest?city=Los%20Angeles');
		const data = await response.json();
		// Вернём нужные данные
		return new Response(JSON.stringify(data), {
			status: 200,
			headers: {
				'content-type': 'application/json'
			}
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
}
