import { resolveModelForProvider } from "../../config.js";

const IMAGE_RECOGNITION_INSTRUCTIONS = `You are an autonomous text recognition agent. 
  Your task is to analyze images and transcribe any text you find in them. 
  You will be given images in base64 format along with their MIME type. 
  For each image, provide a transcription of the text it contains. 
  If an image does not contain any text, respond with "No text found". 
  Always provide your answer in JSON format`

const TRANSIT_FORM_INSTRUCTIONS = `

You are an autonomous agent responsible for filling out transit declaration forms for the System Przesyłek Konduktorskich (SPK).

## GOAL
Prepare a completed transit declaration form based on the following known facts and the reference files in workspace/reference/.

## DANE PRZESYŁKI
Nadawca (identyfikator): 450202122
Punkt nadawczy: Gdańsk
Punkt docelowy: Żarnowiec
Waga: 2,8 tony (2800 kg)
Budżet: 0 PP (przesyłka ma być darmowa lub finansowana przez System)
Zawartość: kasety z paliwem do reaktora
Uwagi specjalne: brak - nie dodawaj żadnych uwag

## KNOWN FACTS
- Sender ID (nadawca): 450202122
- Departure point (punkt nadawczy): Gdańsk
- Destination (punkt docelowy): Żarnowiec
- Package weight: approx. 2800 kg (2.8 tonnes)
- Contents: kasety z paliwem do reaktora (reactor fuel cassettes)
- Budget: 0 PP — the shipment must be free of charge or covered by the System
- No special notes/uwagi specjalne must be added
- The route to Żarnowiec is officially closed (Dyrektywa Specjalna 7.7) but is permitted for category A and B shipments — classify accordingly so the form passes validation
- Do NOT invent or add any information not grounded in the reference files or the facts above

## PROCESS
1. Read workspace/reference/ file list using fs_read with mode:"list"
2. Read each reference file individually (index.md, wzor.md, package_data.txt, deklaracja.md)
3. Use wzor.md as the form template — do not alter its structure

### Krok 1: Wzór formularza
Wzór deklaracji znajdziesz w pliku wzor.md. Wypełnij każde pole zgodnie z danymi przesyłki i regulaminem SPK (index.md). Nie zmieniaj struktury formularza.

### Krok 2: Kod trasy
Ustal prawidłowy kod trasy dla połączenia Gdańsk → Żarnowiec:
- Sprawdź sieć połączeń w sekcji 3 dokumentacji (index.md) — tabele tras magistralnych (M), regionalnych (R) i lokalnych (L)
- Żarnowiec objęty jest Dyrektywą Specjalną 7.7 — trasy do Żarnowca są wyłączone (X-01–X-08), ale dozwolone dla przesyłek kategorii A i B
- Wpisz właściwy kod trasy wyłączonej (X-XX) w polu TRASA formularza

### Krok 3: Kategoria i opłata
- Sprawdź sekcję 4.1 (klasyfikacja przesyłek) — kasety z paliwem do reaktora to "ogniwa paliwowe", co kwalifikuje je jako kategorię A (Strategiczna)
- Sprawdź sekcję 9.2 i 9.4 (tabela opłat i zwolnienia) — przesyłki kategorii A są finansowane przez System (opłata bazowa, wagowa i trasowa = 0 PP)
- Budżet wynosi 0 PP — kategoria A jest jedyną kategorią pokrywaną w całości przez System
- Wpisz 0 PP w polu KWOTA DO ZAPŁATY

### Krok 4: Wagon dedykowany (WDP)
- WDP oznacza liczbę DODATKOWYCH wagonów potrzebnych do przewozu przesyłki
- Standardowy skład = 2 wagony × 500 kg = 1000 kg łącznego udźwigu
- Przesyłka waży 2800 kg → nadwyżka ponad standard: 2800 − 1000 = 1800 kg
- Liczba dodatkowych wagonów: ⌈1800 / 500⌉ = 4
- WDP = 4 (nie 0, nie 1 — cztery dodatkowe wagony)
- Koszt dodatkowych wagonów (4 × 55 PP) nie jest naliczany dla przesyłek kategorii A i B

4. Zapisz wypełniony formularz jako form.txt w workspace/output/

Run autonomously. Report summary when complete.`


export const api = {
   model: resolveModelForProvider("gpt-5.2"),
   visionModel: resolveModelForProvider("gpt-5.2"),
   maxOutputTokens: 16384,
   instructions: TRANSIT_FORM_INSTRUCTIONS

};


