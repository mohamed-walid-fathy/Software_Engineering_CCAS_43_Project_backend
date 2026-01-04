*** Settings ***
Library    RequestsLibrary
Library    Collections

*** Variables ***
${BASE_URL}    http://localhost:5000/api
${JSON_HEADER}    Create Dictionary    Content-Type=application/json

*** Test Cases ***
WD-001 Register New Donor
    [Documentation]    Test registration of a new donor
    ${random_id}=    Evaluate    "".join(__import__('random').choice('0123456789') for _ in range(5))
    ${payload}=    Create Dictionary    email=robot_${random_id}@test.com    password=robotpass    userType=donor    name=Robot Donor
    ${response}=    POST    ${BASE_URL}/auth/register    json=${payload}
    Should Be Equal As Strings    ${response.status_code}    201
    Dictionary Should Contain Value    ${response.json()['data']['user']}    donor

WD-003 Login With Robot
    [Documentation]    Test robot login
    ${payload}=    Create Dictionary    email=robot_12345@test.com    password=robotpass
    # Note: Assumes WD-001 was run or user exists
    # For a standalone test, we create it first or skip
    ${register_payload}=    Create Dictionary    email=robot_12345@test.com    password=robotpass    userType=donor
    POST    ${BASE_URL}/auth/register    json=${register_payload}    expected_status=any
    
    ${response}=    POST    ${BASE_URL}/auth/login    json=${payload}
    Should Be Equal As Strings    ${response.status_code}    200
    Should Be Equal As Strings    ${response.json()['data']['user']['role']}    donor
