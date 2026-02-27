<p>S3 버킷에 PDF 파일이 업로드될 때, AWS Lambda가 자동으로 실행되어 텍스트를 추출하고 로그를 기록하는 아키텍처 및 구현 방법을 설명한다.</p>
<h3>1. Overview</h3>
<p>사용자가 특정 S3 경로에 PDF 자기소개서를 업로드하면, S3 Event Notification이 Lambda 함수를 호출합니다. Lambda는 해당 PDF를 메모리에 로드하여 <strong>pypdf</strong> 라이브러리로 텍스트를 추출한 뒤 CloudWatch에 결과를 출력합니다.</p>
<h3>2. 설정</h3>
<p>2.1. S3 트리거 설정</p>
<p>특정 버킷 및 경로에 <code>.pdf</code> 파일이 생성될 때만 이벤트가 발생하도록 설정한다.</p>

항목 | 설정 값
-- | --
Event Type | s3:ObjectCreated:Put
Prefix (접두사) | coverletter/
Suffix (접미사) | .pdf
IAM Policy | S3 Read Access (GetObject 권한)


<p>2.2. Lambda 레이어</p>
<p>Lambda 환경에는 <code>pypdf</code> 라이브러리가 포함되어 있지 않으므로 로컬에서 라이브러리를 설치한 후 zip파일로 만들어서 람다 레이어로 추가하였다.</p>
<h3>3. 구현</h3>

```py
def lambda_handler(event, context):
    try:
        bucket = event['Records'][0]['s3']['bucket']['name']
        key = event['Records'][0]['s3']['object']['key']
        print(f&quot;Processing file: {key} from bucket: {bucket}&quot;)
    except KeyError:
        return {&quot;statusCode&quot;: 400, &quot;body&quot;: &quot;Invalid S3 event format&quot;}

    try:
        # 2. S3에서 파일 데이터를 메모리로 가져오기
        response = s3_client.get_object(Bucket=bucket, Key=key)
        print(f&quot;Content Type: {response['ContentType']}&quot;)
        
        # 3. PDF 데이터 처리 (io.BytesIO 사용)
        pdf_data = io.BytesIO(response['Body'].read())
        reader = PdfReader(pdf_data)
        
        # 4. 텍스트 추출 로직
        extracted_text = &quot;&quot;
        for page_num, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                extracted_text += f&quot;\\n[Page {page_num + 1}]\\n&quot; + text
        
        # 5. 결과 검증 및 로그 출력
        if not extracted_text.strip():
            print(f&quot;Warning: No text extracted from {key}. It might be an image-based PDF.&quot;)
        else:
            print(f&quot;Successfully extracted {len(extracted_text)} characters.&quot;)
            # 추출된 텍스트의 앞부분 확인 (CloudWatch에서 확인 가능)
            print(&quot;Extracted Preview:&quot;, extracted_text[:300])

        return {
            'statusCode': 200,
            'body': json.dumps(f'Successfully processed {key}')
        }

    except Exception as e:
        print(f&quot;Error processing {key}: {str(e)}&quot;)
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error: {str(e)}')
        }
```
<h3>4. 검증</h3>
<p>작업 완료 후 <strong>Amazon CloudWatch</strong>를 통해 실행 로그를 확인할 수 있다.</p>
<ul>
<li><strong>성공 시:</strong> <code>Successfully extracted [N] characters</code> 로그와 함께 추출된 텍스트 본문 출력 확인.</li>
<li><strong>실패 시:</strong> 에러 반환</li>
</ul>
<img width="600" height="200" alt="image" src="https://github.com/user-attachments/assets/263db6ec-926c-44db-b9bf-ad5a7d09ed80" />

<p>실제로 s3에 pdf를 업로드 해보면, pdf의 텍스트가 추출되어 로그로 출력된 것을 확인할 수 있다.</p>
<!-- notionvc: 980969a4-5c08-433f-a0a4-dcd8ae3dcc73 -->