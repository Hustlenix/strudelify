"""Publication failure cases using explicitly synthetic fixtures, never listener evidence."""
from pathlib import Path
import copy, hashlib, json, shutil, sys, tempfile, unittest, zipfile
from release_policy import validate_artifact, validate_approval

SOURCE=Path(sys.argv[1]).resolve()
TEMP_ROOT=Path(__file__).resolve().parent/'artifacts'
TEMP_ROOT.mkdir(exist_ok=True)


class ReleasePolicyTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(prefix='policy-fixture-',dir=TEMP_ROOT)
        self.folder=Path(self.temp.name).resolve()
        assert self.folder.is_relative_to(TEMP_ROOT.resolve())
        shutil.copytree(SOURCE,self.folder,dirs_exist_ok=True)
        self.manifest=validate_artifact(self.folder)
        self.manifest['dirty']=False
        self.approval={'approved_commit':self.manifest['commit'],'publication_approved':True,
            'owner':'SYNTHETIC-UNIT-FIXTURE','approved_at':'2026-10-18T00:00:00Z',
            'integrated_license':'AGPL-3.0-or-later','original_provenance_confirmed':True,
            'branding':{'public_name':'Hustlenix Music','decision_evidence':'SYNTHETIC',
                        'upstream_permission_evidence':'SYNTHETIC; NO ACTUAL PERMISSION'},
            'devices':{name:{'physical_device':True,'passed':True,'model_browser':'SYNTHETIC',
                       'observations':'UNIT TEST ONLY'} for name in ['phone','laptop']},'tracks':[]}
        for row in json.loads((self.folder/'tracks/catalog.json').read_text()):
            self.approval['tracks'].append({'id':row['id'],'listened_complete':True,
                'accepted_for_beta':True,'reviewer':'SYNTHETIC','observations':'UNIT TEST ONLY',
                'score_sha256':hashlib.sha256((self.folder/'tracks'/f"{row['id']}.strudel").read_bytes()).hexdigest()})

    def tearDown(self):
        assert self.folder.is_relative_to(TEMP_ROOT.resolve())
        self.temp.cleanup()

    def test_actual_artifact(self):
        validate_artifact(self.folder)

    def test_synthetic_complete_record(self):
        self.assertTrue(validate_approval(self.approval,self.manifest,self.folder))

    def test_extra_audio_rejected(self):
        (self.folder/'unapproved.mp3').write_bytes(b'fixture')
        with self.assertRaises(ValueError): validate_artifact(self.folder)

    def test_tampered_payload_rejected(self):
        (self.folder/'app.js').write_text('tampered fixture')
        with self.assertRaises(ValueError): validate_artifact(self.folder)

    def test_hidden_zip_payload_rejected(self):
        with zipfile.ZipFile(self.folder/'source.zip','a') as archive:
            archive.writestr('private/reference.mp3',b'fixture')
        data=json.loads((self.folder/'release.json').read_text())
        next(row for row in data['files'] if row['path']=='source.zip')['sha256']=hashlib.sha256((self.folder/'source.zip').read_bytes()).hexdigest()
        (self.folder/'release.json').write_text(json.dumps(data))
        with self.assertRaises(ValueError): validate_artifact(self.folder)

    def test_missing_owner_approval_rejected(self):
        self.approval['publication_approved']=False
        with self.assertRaises(ValueError): validate_approval(self.approval,self.manifest,self.folder)

    def test_other_commit_rejected(self):
        self.approval['approved_commit']='0'*40
        with self.assertRaises(ValueError): validate_approval(self.approval,self.manifest,self.folder)

    def test_dirty_build_rejected(self):
        self.manifest['dirty']=True
        with self.assertRaises(ValueError): validate_approval(self.approval,self.manifest,self.folder)

    def test_missing_phone_rejected(self):
        self.approval['devices']['phone']['physical_device']=False
        with self.assertRaises(ValueError): validate_approval(self.approval,self.manifest,self.folder)

    def test_missing_music_review_rejected(self):
        self.approval['tracks'][0]['listened_complete']=False
        with self.assertRaises(ValueError): validate_approval(self.approval,self.manifest,self.folder)

    def test_changed_score_rejected(self):
        self.approval['tracks'][0]['score_sha256']='0'*64
        with self.assertRaises(ValueError): validate_approval(self.approval,self.manifest,self.folder)

    def test_pending_naming_permission_rejected(self):
        self.approval['branding']['public_name']='Strudelify'
        self.approval['branding']['upstream_permission_evidence']=None
        with self.assertRaises(ValueError): validate_approval(self.approval,self.manifest,self.folder)


if __name__=='__main__':
    result=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(ReleasePolicyTests))
    report={'tests_run':result.testsRun,'failures':len(result.failures),'errors':len(result.errors),
        'passed':result.wasSuccessful(),'human_evidence':False,'fixture':'synthetic; never publication approval'}
    Path('release-audit/reports/release-policy-tests.json').write_text(json.dumps(report,indent=2)+'\n')
    raise SystemExit(0 if result.wasSuccessful() else 1)
